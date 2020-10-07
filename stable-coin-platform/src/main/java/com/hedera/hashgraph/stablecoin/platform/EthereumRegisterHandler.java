package com.hedera.hashgraph.stablecoin.platform;

import io.github.jklingsporn.vertx.jooq.classic.reactivepg.ReactiveClassicGenericQueryExecutor;
import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Function;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.utils.Convert;

import java.io.IOException;
import java.math.BigInteger;
import java.util.Collections;

import static com.hedera.hashgraph.stablecoin.platform.db.Tables.ACCOUNT;

public final class EthereumRegisterHandler implements Handler<RoutingContext> {
    private final ReactiveClassicGenericQueryExecutor queryExecutor;

    private final Web3j web3j;

    private final Credentials complianceManagerCredentials;

    private final Credentials supplyManagerCredentials;

    private final String contractAddress;

    EthereumRegisterHandler(
        ReactiveClassicGenericQueryExecutor queryExecutor,
        Web3j web3j,
        Credentials complianceManagerCredentials,
        Credentials supplyManagerCredentials,
        String contractAddress
    ) {
        this.queryExecutor = queryExecutor;
        this.web3j = web3j;
        this.complianceManagerCredentials = complianceManagerCredentials;
        this.supplyManagerCredentials = supplyManagerCredentials;
        this.contractAddress = contractAddress;
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
        var address = new Address(data.address);

        // FIXME: this is for exposition only; in a production system
        //        there would be other compliance checks before we move on
        //        to the next step

        // mark the account as passing KYC
        routingContext.vertx().executeBlocking(promise -> {
            var setKycPassed = new Function(
                "setKycPassed",
                Collections.singletonList(address),
                Collections.emptyList());

            try {
                var nonce = EthereumTransactionHelper.getNonce(web3j, complianceManagerCredentials);

                // send 0.2 eth so the account can do something
                EthereumTransactionHelper.signAndSendTransaction(
                    nonce, web3j, supplyManagerCredentials, address, Convert.toWei("0.2", Convert.Unit.ETHER).toBigInteger());

                nonce = nonce.add(BigInteger.ONE);
                EthereumTransactionHelper.signAndSendFunction(
                    nonce, web3j, complianceManagerCredentials, contractAddress, setKycPassed);

                promise.complete();
            } catch (IOException e) {
                promise.fail(e);
            }
        }, event -> {
            if (event.failed()) {
                routingContext.fail(event.cause());
                return;
            }

            // insert the account information to our local database

            queryExecutor.execute(dsl -> dsl.insertInto(ACCOUNT)
                .columns(ACCOUNT.DISPLAY_NAME, ACCOUNT.ADDRESS, ACCOUNT.NETWORK)
                .values(data.displayName, address.toUint().getValue().toByteArray(), (short) 2)
            ).onFailure(routingContext::fail).onSuccess(v -> {

                // return from the request with 200
                routingContext.response().end();
            });
        });
    }
}
