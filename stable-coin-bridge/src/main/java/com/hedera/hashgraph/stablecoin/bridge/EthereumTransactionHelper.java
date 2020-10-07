package com.hedera.hashgraph.stablecoin.bridge;

import org.web3j.abi.FunctionEncoder;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Function;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.RawTransaction;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.tx.RawTransactionManager;

import java.io.IOException;
import java.math.BigInteger;

// NOTE: This class is used in both this bridge and the platform
//       As these are intended for different spaces it's copied but it might help to
//       put this somewhere that can be shared
public class EthereumTransactionHelper {
    public static BigInteger getNonce(Web3j web3j, Credentials credentials) throws IOException {
        return web3j.ethGetTransactionCount(credentials.getAddress(), DefaultBlockParameterName.PENDING).send().getTransactionCount();
    }

    public static void signAndSendTransaction(
        BigInteger nonce,
        Web3j web3j,
        Credentials credentials,
        Address toAddress,
        BigInteger amount
    ) throws IOException {
        var gasPrice = web3j.ethGasPrice().send().getGasPrice();

        var rawTransactionManager = new RawTransactionManager(web3j, credentials);

        var rawTransaction = RawTransaction.createEtherTransaction(
            nonce,
            gasPrice,
            BigInteger.valueOf(500_000),
            toAddress.toString(),
            amount
        );

        var encodedRawTransaction = rawTransactionManager.sign(rawTransaction);
        var response = web3j.ethSendRawTransaction(encodedRawTransaction).send();

        if (response.hasError()) {
            throw new RuntimeException(response.getError().getMessage());
        }
    }

    public static void signAndSendFunction(
        BigInteger nonce,
        Web3j web3j,
        Credentials credentials,
        String contractAddress,
        Function function
    ) throws IOException {
        // TODO: an optimization could cache this and not ask so frequently
        var gasPrice = web3j.ethGasPrice().send().getGasPrice();

        var rawTransactionManager = new RawTransactionManager(web3j, credentials);
        var rawTransaction = RawTransaction.createTransaction(
            nonce,
            gasPrice,
            BigInteger.valueOf(500_000),
            contractAddress,
            FunctionEncoder.encode(function)
        );

        var encodedRawTransaction = rawTransactionManager.sign(rawTransaction);
        var response = web3j.ethSendRawTransaction(encodedRawTransaction).send();

        if (response.hasError()) {
            throw new RuntimeException(response.getError().getMessage());
        }
    }
}
