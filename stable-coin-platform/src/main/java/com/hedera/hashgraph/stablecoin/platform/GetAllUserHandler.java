package com.hedera.hashgraph.stablecoin.platform;

import com.hedera.hashgraph.sdk.consensus.ConsensusTopicId;
import io.github.jklingsporn.vertx.jooq.classic.reactivepg.ReactiveClassicGenericQueryExecutor;
import io.vertx.core.Handler;
import io.vertx.core.json.Json;
import io.vertx.ext.web.RoutingContext;

import static com.hedera.hashgraph.stablecoin.platform.db.Tables.ACCOUNT;

public class GetAllUserHandler implements Handler<RoutingContext> {
    private final ReactiveClassicGenericQueryExecutor queryExecutor;

    private final ConsensusTopicId hederaTopicId;

    private final String ethereumContractAddress;

    GetAllUserHandler(ReactiveClassicGenericQueryExecutor queryExecutor, ConsensusTopicId hederaTopicId, String ethereumContractAddress) {
        this.queryExecutor = queryExecutor;
        this.hederaTopicId = hederaTopicId;
        this.ethereumContractAddress = ethereumContractAddress;
    }

    GetAllUserHandler(ReactiveClassicGenericQueryExecutor queryExecutor, ConsensusTopicId hederaTopicId) {
        this(queryExecutor, hederaTopicId, "");
    }

    @Override
    public void handle(RoutingContext routingContext) {
        queryExecutor.findManyRow(dsl -> dsl.select(
            ACCOUNT.ID,
            ACCOUNT.CREATED_AT,
            ACCOUNT.DISPLAY_NAME,
            ACCOUNT.ADDRESS,
            ACCOUNT.NETWORK,
            ACCOUNT.FLAG,
            ACCOUNT.FLAG_AT,
            ACCOUNT.FLAG_IGNORED_AT
        ).from(ACCOUNT)).onFailure(routingContext::fail).onSuccess(rows -> {
            var users = rows.stream().map(row -> {
                try {
                    var networkId = row.getShort(4);
                    String network;

                    if (networkId == 1) {
                        network = "hedera:" + hederaTopicId.toString();
                    } else if (networkId == 2) {
                        network = "ethereum:" + ethereumContractAddress;
                    } else {
                        throw new IllegalStateException("unexpected value for network: " + networkId);
                    }

                    var user = new User(
                        row.getOffsetDateTime(1),
                        row.getString(2),
                        row.getBuffer(3),
                        row.getLong(0),
                        network,
                        row.getShort(5),
                        row.getOffsetDateTime(6),
                        row.getOffsetDateTime(7)
                    );

                    return user;
                } catch (Exception e) {
                    e.printStackTrace();

                    throw e;
                }
            });

            routingContext.response()
                .putHeader("content-type", "application/json")
                .end(Json.encodeToBuffer(users.toArray()));
        });
    }
}
