package com.hedera.hashgraph.stablecoin.platform;

import com.hedera.hashgraph.sdk.Client;
import com.hedera.hashgraph.sdk.Hbar;
import com.hedera.hashgraph.sdk.HederaStatusException;
import com.hedera.hashgraph.sdk.consensus.ConsensusMessageSubmitTransaction;
import com.hedera.hashgraph.sdk.consensus.ConsensusTopicId;
import com.hedera.hashgraph.sdk.crypto.ed25519.Ed25519PrivateKey;
import com.hedera.hashgraph.sdk.crypto.ed25519.Ed25519PublicKey;
import com.hedera.hashgraph.stablecoin.sdk.Address;
import com.hedera.hashgraph.stablecoin.sdk.SetKycPassedTransaction;
import io.github.jklingsporn.vertx.jooq.classic.reactivepg.ReactiveClassicGenericQueryExecutor;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static com.hedera.hashgraph.stablecoin.platform.db.Tables.ACCOUNT;

public final class HederaRegisterHandler implements Handler<RoutingContext> {
    private final ReactiveClassicGenericQueryExecutor queryExecutor;

    private final Ed25519PrivateKey complianceManagerPrivateKey;

    private final Client hederaClient;

    private final ConsensusTopicId hederaTopicId;

    private final long operatorAccountNum;

    HederaRegisterHandler(
        ReactiveClassicGenericQueryExecutor queryExecutor,
        Ed25519PrivateKey complianceManagerPrivateKey,
        Client hederaClient,
        ConsensusTopicId hederaTopicId,
        long operatorAccountNum
    ) {
        this.queryExecutor = queryExecutor;
        this.complianceManagerPrivateKey = complianceManagerPrivateKey;
        this.hederaClient = hederaClient;
        this.hederaTopicId = hederaTopicId;
        this.operatorAccountNum = operatorAccountNum;
    }

    @Override
    public void handle(RoutingContext routingContext) {
        // parse the incoming request data
        // we should have received a displayName and a (valid) address
        // the address can be optionally prefixed with the ed25519 prefix

        var body = routingContext.getBodyAsJson();

        if (body == null) {
            routingContext.fail(400);
            return;
        }

        var data = body.mapTo(RegisterRequest.class);
        Ed25519PublicKey publicKey;

        // validates the public key to ensure its 32-bytes and
        // optionally has the expected prefix

        try {
            publicKey = Ed25519PublicKey.fromString(data.address);
        } catch (IllegalStateException e) {
            routingContext.fail(400);
            return;
        }

        // FIXME: this is for exposition only; in a production system
        //        there would be other compliance checks before we move on
        //        to the next step

        // TODO: An optimization would be to immediately return from the
        //       request here and use push notifications to communicate
        //       when its complete or failed

        // mark the account as passing KYC

        routingContext.vertx().<String>executeBlocking(promise -> {
            try {
                promise.complete(executeSetKycTransaction(publicKey));
            } catch (HederaStatusException e) {
                promise.fail(e);
            }
        }, v -> {
            if (v.failed()) {
                routingContext.fail(v.cause());
                return;
            }

            // insert the account information to our local database

            var transactionId = v.result();

            queryExecutor.execute(dsl -> dsl.insertInto(ACCOUNT)
                .columns(ACCOUNT.DISPLAY_NAME, ACCOUNT.ADDRESS, ACCOUNT.NETWORK)
                .values(data.displayName, publicKey.toBytes(), (short) 1)
            ).onFailure(routingContext::fail).onSuccess(v2 -> {

                // return 200 and get out
                // we have recorded the account creation and let the contract know

                routingContext.response()
                    .putHeader("content-type", "application/json")
                    .end(JsonObject.mapFrom(new HederaTransactionResponse(transactionId)).encode());
            });
        });
    }

    private String executeSetKycTransaction(Ed25519PublicKey publicKey) throws HederaStatusException {
        var tx = new SetKycPassedTransaction(operatorAccountNum, complianceManagerPrivateKey, new Address(publicKey));

        new ConsensusMessageSubmitTransaction()
            .setTransactionId(tx.transactionId)
            .setMessage(tx.toByteArray())
            .setTopicId(hederaTopicId)
            .setMaxTransactionFee(new Hbar(2))
            .execute(hederaClient);

        return tx.transactionId.accountId.account + "/" + ChronoUnit.NANOS.between(Instant.EPOCH, tx.transactionId.validStart);
    }
}
