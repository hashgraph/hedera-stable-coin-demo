package com.hedera.hashgraph.stablecoin.platform;

import com.hedera.hashgraph.sdk.Client;
import com.hedera.hashgraph.sdk.Hbar;
import com.hedera.hashgraph.sdk.HederaStatusException;
import com.hedera.hashgraph.sdk.consensus.ConsensusMessageSubmitTransaction;
import com.hedera.hashgraph.sdk.consensus.ConsensusTopicId;
import com.hedera.hashgraph.sdk.crypto.ed25519.Ed25519PrivateKey;
import com.hedera.hashgraph.sdk.crypto.ed25519.Ed25519PublicKey;
import com.hedera.hashgraph.stablecoin.sdk.Address;
import com.hedera.hashgraph.stablecoin.sdk.MintTransaction;
import com.hedera.hashgraph.stablecoin.sdk.Transaction;
import com.hedera.hashgraph.stablecoin.sdk.TransferTransaction;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.math.BigInteger;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

public final class HederaIssueHandler implements Handler<RoutingContext> {
    private final long operatorAccountNum;

    private final Ed25519PrivateKey supplyManagerPrivateKey;

    private final Client hederaClient;

    private final ConsensusTopicId hederaTopicId;

    HederaIssueHandler(
        Ed25519PrivateKey supplyManagerPrivateKey,
        Client hederaClient,
        ConsensusTopicId hederaTopicId,
        long operatorAccountNum
    ) {
        this.supplyManagerPrivateKey = supplyManagerPrivateKey;
        this.hederaClient = hederaClient;
        this.hederaTopicId = hederaTopicId;
        this.operatorAccountNum = operatorAccountNum;
    }

    @Override
    public void handle(RoutingContext routingContext) {
        // parse the incoming request data
        // we should have received an amount and a (valid) address
        // the address can be optionally prefixed with the ed25519 prefix

        var body = routingContext.getBodyAsJson();

        if (body == null) {
            routingContext.fail(400);
            return;
        }

        var data = body.mapTo(IssueRequest.class);
        Ed25519PublicKey publicKey;
        var amount = new BigInteger(data.amount);

        // validates the public key to ensure its 32-bytes and
        // optionally has the expected prefix

        try {
            publicKey = Ed25519PublicKey.fromString(data.address);
        } catch (IllegalStateException e) {
            routingContext.fail(400);
            return;
        }

        // FIXME: this is for exposition only; in a production system
        //        there would be an exchange of payment before we move on
        //        to the next step

        // TODO: An optimization would be to immediately return from the
        //       request here and use push notifications to communicate
        //       when its complete or failed

        // issue some money to the address

        routingContext.vertx().<String>executeBlocking(promise -> {
            try {
                executeMintTransaction(amount);

                var transactionId = executeTransferTransaction(publicKey, amount);

                promise.complete(transactionId);
            } catch (HederaStatusException e) {
                promise.fail(e);
            }
        }, v -> {
            if (v.failed()) {
                routingContext.fail(v.cause());
                return;
            }

            routingContext.response()
                .putHeader("content-type", "application/json")
                .end(JsonObject.mapFrom(new HederaTransactionResponse(v.result())).encode());
        });
    }

    private ConsensusMessageSubmitTransaction prepareTransaction(Transaction tx) {
        return new ConsensusMessageSubmitTransaction()
            .setMessage(tx.toByteArray())
            .setTransactionId(tx.transactionId)
            .setTopicId(hederaTopicId)
            .setMaxTransactionFee(new Hbar(2));
    }

    private void executeMintTransaction(BigInteger amount) throws HederaStatusException {
        prepareTransaction(new MintTransaction(operatorAccountNum, supplyManagerPrivateKey, amount))
            .execute(hederaClient)
            // we need to wait for receipt here
            // so the transactions are properly ordered
            // as there is no "mint to" transaction
            .getReceipt(hederaClient);
    }

    private String executeTransferTransaction(Ed25519PublicKey to, BigInteger amount) throws HederaStatusException {
        var tx = new TransferTransaction(
            operatorAccountNum, supplyManagerPrivateKey, new Address(to), amount
        );

        prepareTransaction(tx).execute(hederaClient);

        return tx.transactionId.accountId.account + "/" + ChronoUnit.NANOS.between(Instant.EPOCH, tx.transactionId.validStart);
    }
}
