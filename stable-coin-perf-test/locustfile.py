import random
import time

import gevent
import grpc
from locust import User, events, task, constant
from locust.clients import HttpSession
from nacl.signing import SigningKey


# [transfer]

# 1) prepare (and sign) hsc transfer transaction to <TRANSFER>

# 2) prepare (and sign) hedera transaction

# 3) send hedera transaction

# 4) wait for transaction receipt


def stopwatch(task_name):
    def stopwatch(func):
        def wrapper(*args, **kwargs):
            start = time.time()
            result = None
            try:
                result = func(*args, **kwargs)
            except Exception as e:
                total = int((time.time() - start) * 1000)
                events.request_failure.fire(request_type="FUNC",
                                            name=task_name,
                                            response_time=total,
                                            response_length=0,
                                            exception=e)
            else:
                total = int((time.time() - start) * 1000)
                events.request_success.fire(request_type="FUNC",
                                            name=task_name,
                                            response_time=total,
                                            response_length=0)
            return result

        return wrapper

    return stopwatch


class StableCoinUser(User):
    wait_time = constant(0)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        # client
        self.node_session = HttpSession(
            base_url="http://128.199.13.131:9000",
            request_success=self.environment.events.request_success,
            request_failure=self.environment.events.request_failure,
        )

        # platform
        self.platform_session = HttpSession(
            base_url="http://128.199.14.196:80",
            request_success=self.environment.events.request_success,
            request_failure=self.environment.events.request_failure,
        )

    @task
    def transfer(self):
        # 1) prepare (and sign) HSC transfer transaction
        hsc_transaction, operator, valid_start = prepare_hsc_transfer_transaction()

        # 2) sign Hedera (HCS) transaction
        response = self.platform_session.post("/hedera/transaction", data=hsc_transaction)

        # 3) submit Hedera (HCS) transaction (x1000)
        send_hedera_transaction(response.content)

        # 4) wait for confirmation
        wait_for_confirmation(self.node_session, operator, valid_start)


def generate_valid_start_nanos():
    # to generate a reasonably random nonce we
    # take the current nanos and then add a random 2 to 8 second drift

    now_nanos = time.time_ns()
    drift = random.randint(2 * 1000000000, 8 * 1000000000)  # 2 to 8 ns
    return now_nanos - drift


@stopwatch("wait_for_confirmation")
def wait_for_confirmation(session, operator, valid_start):
    while True:
        response = session.get(
            f"/transaction/{operator}/{valid_start}/receipt",
            name="/transaction/:id/receipt",
            catch_response=True)

        if response.status_code == 404:
            # time.sleep(0.05) # wait 50 ms
            gevent.sleep(0.1)
            continue

        elif response.status_code != 200:
            response.failure()
            return

        data = response.json()
        break


@stopwatch("send_hedera_transaction")
def send_hedera_transaction(transaction_bytes):
    from hedera.ConsensusService_pb2_grpc import ConsensusServiceStub
    from hedera.Transaction_pb2 import Transaction
    from hedera.TransactionBody_pb2 import TransactionBody

    transaction = Transaction()
    transaction.ParseFromString(transaction_bytes)

    transaction_body = TransactionBody()
    transaction_body.ParseFromString(transaction.bodyBytes)

    node = transaction_body.nodeAccountID.accountNum - 3
    url = f"{node}.testnet.hedera.com:50211"

    with grpc.insecure_channel(url) as channel:
        stub = ConsensusServiceStub(channel)

        while True:
            response = stub.submitMessage(transaction)
            status = response.nodeTransactionPrecheckCode

            if status == 12:  # BUSY
                gevent.sleep(0.05)  # wait 50 ms
                continue

            if status != 0:
                raise Exception(f"precheck failed with status: {status}")

            break


@stopwatch("prepare_hsc_transfer_transaction")
def prepare_hsc_transfer_transaction():
    from stablecoin.TransferTransactionData_pb2 import TransferTransactionData
    from stablecoin.TransactionBody_pb2 import TransactionBody
    from stablecoin.Transaction_pb2 import Transaction

    key_from = SigningKey(bytes.fromhex("1aaced2d7b85ca122adfb5e6d15926eddbdfa8f270e40109fa01e3607446c48b"))
    address_from = bytes(key_from.verify_key)

    address_to = bytes.fromhex("c9fef56cee613e390d728399bef53619603b9f0559daab6ba68bf1c24715fb23")
    value = int_to_bytes(100)  # $1.00

    transfer = TransferTransactionData(to=address_to, value=value)
    valid_start = generate_valid_start_nanos()
    body = TransactionBody(caller=address_from, operatorAccountNum=9523, validStartNanos=valid_start, transfer=transfer)
    body_bytes = body.SerializeToString()

    body_signature = key_from.sign(body_bytes).signature

    tx = Transaction(body=body_bytes, signature=body_signature)
    tx_bytes = tx.SerializeToString()

    return tx_bytes, 9523, valid_start


def int_to_bytes(x: int) -> bytes:
    return x.to_bytes((x.bit_length() + 7) // 8, 'big')
