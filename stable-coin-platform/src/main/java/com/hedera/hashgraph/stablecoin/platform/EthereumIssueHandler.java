package com.hedera.hashgraph.stablecoin.platform;

import io.vertx.core.Handler;
import io.vertx.ext.web.RoutingContext;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.utils.Convert;

import java.io.IOException;
import java.math.BigInteger;
import java.util.Collections;
import java.util.List;

public final class EthereumIssueHandler implements Handler<RoutingContext> {
    private final Web3j web3j;

    private final Credentials supplyManagerCredentials;

    private final String contractAddress;

    EthereumIssueHandler(
        Web3j web3j,
        Credentials supplyManagerCredentials,
        String contractAddress
    ) {
        this.web3j = web3j;
        this.supplyManagerCredentials = supplyManagerCredentials;
        this.contractAddress = contractAddress;
    }

    @Override
    public void handle(RoutingContext routingContext) {
        var body = routingContext.getBodyAsJson();

        if (body == null) {
            routingContext.fail(400);
            return;
        }

        // FIXME: this is for exposition only; in a production system
        //        there would be an exchange of payment before we move on
        //        to the next step

        var data = body.mapTo(IssueRequest.class);
        var toAddress = new Address(data.address);
        var amount = new BigInteger(data.amount);

        routingContext.vertx().executeBlocking(promise -> {
            var mint = new Function(
                "mint",
                Collections.singletonList(new Uint256(amount)),
                Collections.emptyList());

            var transferTo = new Function(
                "transfer",
                List.of(toAddress, new Uint256(amount)),
                Collections.emptyList());

            try {
                var nonce = EthereumTransactionHelper.getNonce(web3j, supplyManagerCredentials);

                // mint the tokens
                EthereumTransactionHelper.signAndSendFunction(
                    nonce, web3j, supplyManagerCredentials, contractAddress, mint);

                // send the tokens
                nonce = nonce.add(BigInteger.ONE);
                EthereumTransactionHelper.signAndSendFunction(
                    nonce, web3j, supplyManagerCredentials, contractAddress, transferTo);

                promise.complete();
            } catch (IOException e) {
                promise.fail(e);
            }
        }, event -> {
            if (event.failed()) {
                routingContext.fail(event.cause());
                return;
            }

            routingContext.response().end();
        });
    }
}
