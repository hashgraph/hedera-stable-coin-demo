package com.hedera.hashgraph.stablecoin.platform;

import com.google.protobuf.InvalidProtocolBufferException;
import com.hedera.hashgraph.sdk.Client;
import com.hedera.hashgraph.sdk.Hbar;
import com.hedera.hashgraph.sdk.TransactionId;
import com.hedera.hashgraph.sdk.account.AccountId;
import com.hedera.hashgraph.sdk.consensus.ConsensusMessageSubmitTransaction;
import com.hedera.hashgraph.sdk.consensus.ConsensusTopicId;
import com.hedera.hashgraph.sdk.crypto.ed25519.Ed25519PrivateKey;
import com.hedera.hashgraph.stablecoin.proto.Transaction;
import com.hedera.hashgraph.stablecoin.proto.TransactionBody;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.vertx.core.Handler;
import io.vertx.core.buffer.Buffer;
import io.vertx.ext.web.RoutingContext;

import javax.annotation.Nullable;
import java.time.Instant;
import java.util.Objects;
import java.util.concurrent.ThreadLocalRandom;

public final class TransactionHandler implements Handler<RoutingContext> {
    private final Client hederaClient;

    private final AccountId operatorAccountId;

    private final ConsensusTopicId hederaTopicId;

    private final Ed25519PrivateKey hederaPrivateKey;

    @Nullable
    private final AccountId hederaFixedNodeId;

    TransactionHandler(Client hederaClient, @Nullable AccountId hederaFixedNodeId, AccountId operatorAccountId, ConsensusTopicId hederaTopicId, Ed25519PrivateKey hederaPrivateKey) {
        this.hederaClient = hederaClient;
        this.hederaFixedNodeId = hederaFixedNodeId;
        this.operatorAccountId = operatorAccountId;
        this.hederaTopicId = hederaTopicId;
        this.hederaPrivateKey = hederaPrivateKey;
    }

    @Override
    public void handle(RoutingContext routingContext) {
        var transactionBytes = routingContext.getBody();
        Transaction transaction;
        TransactionBody transactionBody;

        try {
            transaction = Transaction.parseFrom(transactionBytes.getBytes());
            transactionBody = TransactionBody.parseFrom(transaction.getBody());
        } catch (InvalidProtocolBufferException e) {
            e.printStackTrace();

            routingContext.response()
                .setStatusCode(HttpResponseStatus.BAD_REQUEST.code())
                .end();

            return;
        }

        if (transactionBody.getOperatorAccountNum() != operatorAccountId.account) {
            // mismatch between declared operator and the operator we have a
            // key for

            routingContext.response()
                .setStatusCode(HttpResponseStatus.BAD_REQUEST.code())
                .end();

            return;
        }

        // FIXME: this is a demonstration and there is no authority to
        //        ascertain the legitimacy of this transaction, so all
        //        we do is check that it is valid before we sign it

        var validStart = Instant.ofEpochSecond(0, transactionBody.getValidStartNanos());
        var hederaTxId = TransactionId.withValidStart(operatorAccountId, validStart);

        var hederaTxBytes = new ConsensusMessageSubmitTransaction()
            .setTransactionId(hederaTxId)
            .setMessage(transaction.toByteArray())
            .setTopicId(hederaTopicId)
            .setNodeAccountId(Objects.requireNonNullElseGet(hederaFixedNodeId,
                () -> new AccountId(ThreadLocalRandom.current().nextInt(4) + 3)))
            .setMaxTransactionFee(new Hbar(2))
            .build(hederaClient)
            .sign(hederaPrivateKey)
            .toBytes();

        routingContext.response().end(Buffer.buffer(hederaTxBytes));
    }
}
