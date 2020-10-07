package com.hedera.hashgraph.stablecoin.platform;

import com.hedera.hashgraph.stablecoin.sdk.Address;
import io.github.jklingsporn.vertx.jooq.classic.reactivepg.ReactiveClassicGenericQueryExecutor;
import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;

import java.time.OffsetDateTime;

import static com.hedera.hashgraph.stablecoin.platform.db.Tables.ACCOUNT;

public class DismissFlagHandler implements Handler<RoutingContext> {
    private final ReactiveClassicGenericQueryExecutor queryExecutor;

    DismissFlagHandler(ReactiveClassicGenericQueryExecutor queryExecutor) {
        this.queryExecutor = queryExecutor;
    }

    @Override
    public void handle(RoutingContext routingContext) {
        var body = routingContext.getBodyAsJson();

        if (body == null) {
            routingContext.fail(400);
            return;
        }

        var data = body.mapTo(DismissFlagRequest.class);

        var address = Address.fromString(data.address);

        queryExecutor.execute(dsl ->
            dsl.update(ACCOUNT)
                .set(ACCOUNT.FLAG_IGNORED_AT, OffsetDateTime.now())
                .where(ACCOUNT.ADDRESS.eq(address.toBytes()))
        ).onFailure(routingContext::fail).onSuccess(v -> {
            routingContext.response()
                .setStatusCode(204)
                .end();
        });
    }
}
