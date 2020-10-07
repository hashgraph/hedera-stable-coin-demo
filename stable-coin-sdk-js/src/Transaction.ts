import {
    Ed25519PrivateKey as PrivateKey,
    Transaction as HederaTransaction,
} from "@hashgraph/sdk";
import Client from "./Client";
import proto from "@stable-coin/proto";
import * as nacl from "tweetnacl";
import Long from "long";

export default abstract class Transaction<RequestT> {
    private _transactionId: string = "";

    private readonly _validStartNanos: Long;

    constructor() {
        this._validStartNanos = Long.fromValue(Date.now()).mul(1000000);
    }

    public getTransactionId(): string {
        return this._transactionId;
    }

    protected abstract _toData(): RequestT;

    protected abstract _getDataCase(): keyof proto.ITransactionBody;

    public async executeWith(client: Client, caller: PrivateKey) {
        // create a hedera stable coin (HSC) transaction body
        const data = this._toData();
        const txBody: proto.ITransactionBody = {
            // hsc caller address
            caller: caller.publicKey.toBytes(),
            // hedera transaction id
            operatorAccountNum: client._hederaOperatorAccountNum,
            validStartNanos: this._validStartNanos,
            // hsc transaction data
            [this._getDataCase()]: data,
        };

        // make the transaction ID available
        this._transactionId = `${
            client._hederaOperatorAccountNum
        }/${this._validStartNanos.toString()}`;

        // serialize into its binary form
        const txBodyBytes = proto.TransactionBody.encode(txBody).finish();

        // sign with the caller private key
        const signature = nacl.sign.detached(txBodyBytes, caller._keyData);

        // serialize the HSC transaction into its binary form
        const txBytes: Uint8Array = proto.Transaction.encode({
            body: txBodyBytes,
            signature,
        }).finish();

        // request the payment API to prepare and sign a Hedera transaction
        // for submission
        const hederaTxBytesBlob = await (
            await fetch(client._paymentApiUrl, {
                method: "POST",
                body: txBytes,
            })
        ).blob();

        const hederaTxBytesBuffer = await hederaTxBytesBlob.arrayBuffer();
        const hederaTxBytes = new Uint8Array(hederaTxBytesBuffer);

        // deserialize the hedera transaction so we can send it with gRPC
        const transactionId = await HederaTransaction.fromBytes(
            hederaTxBytes
        ).execute(client._hederaClient);

        // (debug) get the hedera transaction receipt
        await transactionId.getReceipt(client._hederaClient);
    }
}
