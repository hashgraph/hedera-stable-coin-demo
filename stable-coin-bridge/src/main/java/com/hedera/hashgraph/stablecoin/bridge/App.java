package com.hedera.hashgraph.stablecoin.bridge;

import com.google.protobuf.ByteString;
import com.google.protobuf.InvalidProtocolBufferException;
import com.hedera.hashgraph.sdk.Client;
import com.hedera.hashgraph.sdk.Hbar;
import com.hedera.hashgraph.sdk.HederaStatusException;
import com.hedera.hashgraph.sdk.account.AccountId;
import com.hedera.hashgraph.sdk.consensus.ConsensusMessageSubmitTransaction;
import com.hedera.hashgraph.sdk.consensus.ConsensusTopicId;
import com.hedera.hashgraph.sdk.crypto.ed25519.Ed25519PrivateKey;
import com.hedera.hashgraph.sdk.crypto.ed25519.Ed25519PublicKey;
import com.hedera.hashgraph.stablecoin.proto.ApproveExternalTransferEventData;
import com.hedera.hashgraph.stablecoin.proto.ExternalTransferTransactionData;
import com.hedera.hashgraph.stablecoin.proto.Transaction;
import com.hedera.hashgraph.stablecoin.proto.TransactionBody;
import com.hedera.hashgraph.stablecoin.sdk.ExternalTransferFromTransaction;
import com.hedera.hashgraph.stablecoin.sdk.ExternalTransferTransaction;
import io.github.cdimascio.dotenv.Dotenv;
import org.java_websocket.client.WebSocketClient;
import org.java_websocket.handshake.ServerHandshake;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.EventValues;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.DynamicBytes;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.abi.datatypes.generated.Uint256;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.Contract;

import java.io.IOException;
import java.math.BigInteger;
import java.net.URI;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import static java.nio.charset.StandardCharsets.UTF_8;

public class App {
    static final Event APPROVE_EXTERNAL_TRANSFER_EVENT = new Event("ApproveExternalTransfer",
        Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {
        }, new TypeReference<Utf8String>() {
        }, new TypeReference<DynamicBytes>() {
        }, new TypeReference<Uint256>() {
        }));

    // access to the system environment overlaid with a .env file, if present
    final Dotenv env = Dotenv.configure().ignoreIfMissing().load();

    final ConsensusTopicId hederaTopicId = requireEnv("HSC_TOPIC_ID")
        .transform(ConsensusTopicId::fromString);

    final AccountId hederaOperatorId = requireEnv("HSC_OPERATOR_ID")
        .transform(AccountId::fromString);

    final Ed25519PrivateKey hederaOperatorKey = requireEnv("HSC_OPERATOR_KEY")
        .transform(Ed25519PrivateKey::fromString);

    final Ed25519PrivateKey supplyManagerPrivateKey = requireEnv("HSC_SUPPLY_MANAGER_KEY")
        .transform(Ed25519PrivateKey::fromString);

    final Client hederaClient = Client.forTestnet()
        .setOperator(hederaOperatorId, hederaOperatorKey);

    final Web3j web3j = Web3j.build(new HttpService(requireEnv("ESC_NODE_URL")));

    final String ethereumContractAddress = requireEnv("ESC_CONTRACT_ADDRESS");

    final String hederaTokenNodeUrl = requireEnv("HSC_NODE_URL");

    final Credentials supplyManagerCredentials = Credentials.create(requireEnv("ESC_SUPPLY_MANAGER_KEY"));

    final WebSocketClient webSocketClient = new WebSocketClient(new URI(hederaTokenNodeUrl)) {
        @Override
        public void onOpen(ServerHandshake serverHandshake) {
            // [...]
            System.out.println("connected to hedera token socket ... ");
        }

        @Override
        public void onMessage(String message) {
            // unhandled
            System.out.println("recv text message ...");
        }

        @Override
        public void onMessage(ByteBuffer message) {
            System.out.println("recv bin message ...");

            com.hedera.hashgraph.stablecoin.proto.Event event;

            try {
                event = com.hedera.hashgraph.stablecoin.proto.Event.parseFrom(message);
            } catch (InvalidProtocolBufferException e) {
                // failed to parse event
                e.printStackTrace();
                return;
            }

            if (!event.hasApproveExternalTransfer()) {
                // not the right event
                return;
            }

            try {
                handleExternalTransferFromHedera(event.getApproveExternalTransfer());
            } catch (HederaStatusException | IOException e) {
                // failed to act on it
                e.printStackTrace();
            }
        }

        @Override
        public void onClose(int code, String reason, boolean remote) {
            // [...]
            System.out.println("disconnected from hedera token socket ... ");
        }

        @Override
        public void onError(Exception ex) {
            ex.printStackTrace();
        }
    };

    private App() throws java.net.URISyntaxException {
    }

    public static void main(String[] args) throws Exception {
        var app = new App();

        var ethFilter = new EthFilter(DefaultBlockParameterName.LATEST, DefaultBlockParameterName.LATEST, app.ethereumContractAddress);
        var topic = EventEncoder.encode(APPROVE_EXTERNAL_TRANSFER_EVENT);

        ethFilter.addSingleTopic(topic);

        // Listen for events from the *ethereum* contract

        // noinspection ResultOfMethodCallIgnored
        app.web3j.ethLogFlowable(ethFilter).subscribe(log -> {
            var eventValues = Contract.staticExtractEventParameters(APPROVE_EXTERNAL_TRANSFER_EVENT, log);
            var typedEvent = new ApproveExternalTransferEvent(eventValues);

            try {
                app.handleExternalTransferFromEthereum(typedEvent);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }, Throwable::printStackTrace);

        // Listen for events from the *hedera* contract
        app.webSocketClient.connectBlocking();

        // wait while the APIs and the topic listener run in the background
        // should listen to SIGINT/SIGTERM to cleanly exit
        while (true) Thread.sleep(0);
    }

    private void handleExternalTransferFromHedera(ApproveExternalTransferEventData event) throws HederaStatusException, IOException {
        var from = Ed25519PublicKey.fromBytes(event.getFrom().toByteArray());
        var toAddr = event.getTo().toStringUtf8();
        var amount = new BigInteger(event.getAmount().toByteArray());

        System.out.println("requested an external transfer of " + amount + " from " + from + " to " + toAddr + " at network " + event.getNetworkURI());

        var networkURI = event.getNetworkURI();
        var network = parseNetworkURI(networkURI);

        if (network == null) {
            return;
        }

        confirmExternalTransferFromHedera(from, toAddr, networkURI, amount);

        if (network.getKey().equals("hedera")) {
            throw new RuntimeException("hedera to hedera transfer is not implemented");
        } else if (network.getKey().equals("ethereum")) {
            externalTransferToEthereum(
                event.getFrom().toByteArray(), event.getTo().toByteArray(), new BigInteger(event.getAmount().toByteArray()), network.getValue());
        }
    }

    private void handleExternalTransferFromEthereum(ApproveExternalTransferEvent event) throws IOException, HederaStatusException {
        var toAddress = new String(event.to, UTF_8);

        System.out.println("requested an external transfer from " + event.from + " to " + toAddress + " at network " + event.networkURI);

        var network = parseNetworkURI(event.networkURI);

        if (network == null) {
            return;
        }

        confirmExternalTransferFromEthereum(event);

        if (network.getKey().equals("hedera")) {
            externalTransferToHedera(event, network.getValue());
        } else if (network.getKey().equals("ethereum")) {
            externalTransferToEthereum(event.from.getBytes(), event.to, event.amount, network.getValue());
        }
    }

    private void confirmExternalTransferFromEthereum(ApproveExternalTransferEvent event) throws IOException {
        var externalTransfer = new Function(
            "externalTransfer",
            List.of(
                new Address(event.from),
                new Utf8String(event.networkURI),
                new DynamicBytes(event.to),
                new Uint256(event.amount)
            ),
            Collections.emptyList());

        var nonce = EthereumTransactionHelper.getNonce(web3j, supplyManagerCredentials);

        EthereumTransactionHelper.signAndSendFunction(
            nonce, web3j, supplyManagerCredentials, ethereumContractAddress, externalTransfer);
    }

    private void externalTransferToEthereum(byte[] from, byte[] to, BigInteger amount, String networkAddress) throws IOException {
        var externalTransferFrom = new Function(
            "externalTransferFrom",
            List.of(
                new DynamicBytes(from),
                new Utf8String("hedera:" + hederaTopicId.toString()),
                new Address(new String(to, UTF_8)),
                new Uint256(amount)
            ),
            Collections.emptyList());

        var nonce = EthereumTransactionHelper.getNonce(web3j, supplyManagerCredentials);

        EthereumTransactionHelper.signAndSendFunction(
            nonce, web3j, supplyManagerCredentials, networkAddress, externalTransferFrom);
    }

    // from, toAddr, networkURI, event.getAmount()
    private void confirmExternalTransferFromHedera(
        Ed25519PublicKey publicKey, String toAddress, String networkURI, BigInteger amount
    ) throws HederaStatusException {
        prepareHederaExternalTransferTransaction(
            publicKey,
            toAddress.getBytes(UTF_8),
            amount,
            networkURI
        ).execute(hederaClient).getReceipt(hederaClient);
    }

    private void externalTransferToHedera(ApproveExternalTransferEvent event, String networkAddress) throws HederaStatusException {
        prepareHederaExternalTransferFromTransaction(event.to, event.from, event.amount, networkAddress)
            .execute(hederaClient)
            .getReceipt(hederaClient);
    }

    // transfer from something else _to_ hedera
    private ConsensusMessageSubmitTransaction prepareHederaExternalTransferFromTransaction(
        byte[] toAddress, String fromAddress, BigInteger amount, String networkAddress
    ) {
        var toPublicKey = Ed25519PublicKey.fromString(new String(toAddress, UTF_8));

        var txBytes = new ExternalTransferFromTransaction(
            hederaOperatorId.account,
            supplyManagerPrivateKey,
            fromAddress.getBytes(UTF_8),
            "ethereum:" + ethereumContractAddress,
            new com.hedera.hashgraph.stablecoin.sdk.Address(toPublicKey),
            amount
        ).toByteArray();

        var topicId = ConsensusTopicId.fromString(networkAddress);

        return prepareHederaTransaction(txBytes, topicId);
    }

    // transfer out of hedera _to_ something else
    private ConsensusMessageSubmitTransaction prepareHederaExternalTransferTransaction(
        Ed25519PublicKey fromAddress, byte[] toAddress, BigInteger amount, String networkURI
    ) {
        var txBytes = new ExternalTransferTransaction(
            hederaOperatorId.account,
            supplyManagerPrivateKey,
            new com.hedera.hashgraph.stablecoin.sdk.Address(fromAddress),
            networkURI,
            toAddress,
            amount
        ).toByteArray();

        return prepareHederaTransaction(txBytes, hederaTopicId);
    }

    private ConsensusMessageSubmitTransaction prepareHederaTransaction(byte[] message, ConsensusTopicId topicId) {
        return new ConsensusMessageSubmitTransaction()
            .setMessage(message)
            .setTopicId(topicId)
            .setMaxTransactionFee(new Hbar(2));
    }

    private Map.Entry<String, String> parseNetworkURI(String networkURI) {
        var networkUriParts = networkURI.split(":");

        if (networkUriParts.length != 2) {
            System.err.println("unrecognized format for the network URI: " + networkURI);
            return null;
        }

        var networkScheme = networkUriParts[0];
        var networkAddress = networkUriParts[1];

        if (!(networkScheme.equals("hedera") || networkScheme.equals("ethereum"))) {
            System.err.println("unsupported network: " + networkURI);
            return null;
        }

        return Map.entry(networkScheme, networkAddress);
    }

    private String requireEnv(String name) {
        return Objects.requireNonNull(env.get(name), "missing environment variable " + name);
    }

    private static class ApproveExternalTransferEvent {
        public final String from;

        public final String networkURI;

        public final byte[] to;

        public final BigInteger amount;

        public ApproveExternalTransferEvent(EventValues eventValues) {
            from = (String) eventValues.getNonIndexedValues().get(0).getValue();
            networkURI = (String) eventValues.getNonIndexedValues().get(1).getValue();
            to = (byte[]) eventValues.getNonIndexedValues().get(2).getValue();
            amount = (BigInteger) eventValues.getNonIndexedValues().get(3).getValue();
        }
    }
}
