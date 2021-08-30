package com.hedera.hashgraph.stablecoin.platform;

import com.hedera.hashgraph.sdk.Client;
import com.hedera.hashgraph.sdk.account.AccountId;
import com.hedera.hashgraph.sdk.consensus.ConsensusTopicId;
import com.hedera.hashgraph.sdk.crypto.ed25519.Ed25519PrivateKey;
import io.github.cdimascio.dotenv.Dotenv;
import io.github.jklingsporn.vertx.jooq.classic.reactivepg.ReactiveClassicGenericQueryExecutor;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.DeploymentOptions;
import io.vertx.core.Promise;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.ext.web.handler.CorsHandler;
import io.vertx.pgclient.PgConnectOptions;
import io.vertx.pgclient.PgPool;
import io.vertx.sqlclient.PoolOptions;
import org.flywaydb.core.Flyway;
import org.jooq.SQLDialect;
import org.jooq.impl.DefaultConfiguration;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

import javax.annotation.Nullable;
import java.util.Objects;
import java.util.Optional;

public final class PlatformVerticle extends AbstractVerticle {
    // access to the system environment overlaid with a .env file, if present
    final static Dotenv env = Dotenv.configure().ignoreIfMissing().load();

    final ConsensusTopicId hederaTopicId = requireEnv("HSC_TOPIC_ID")
        .transform(ConsensusTopicId::fromString);

    final AccountId hederaOperatorId = requireEnv("HSC_OPERATOR_ID")
        .transform(AccountId::fromString);

    final Ed25519PrivateKey hederaOperatorKey = requireEnv("HSC_OPERATOR_KEY")
        .transform(Ed25519PrivateKey::fromString);

    final Ed25519PrivateKey complianceManagerPrivateKey = requireEnv("HSC_COMPLIANCE_MANAGER_KEY")
        .transform(Ed25519PrivateKey::fromString);

    final Ed25519PrivateKey supplyManagerPrivateKey = requireEnv("HSC_SUPPLY_MANAGER_KEY")
        .transform(Ed25519PrivateKey::fromString);

    final Client hederaClient = Client.forTestnet()
        .setOperator(hederaOperatorId, hederaOperatorKey);

    final int httpPort = Optional.ofNullable(env.get("HSC_HTTP_PORT")).map(Integer::parseInt).orElse(9005);

    @Nullable
    final AccountId hederaFixedNodeId = Optional.ofNullable(env.get("HSC_FIXED_NODE_ID")).map(AccountId::fromString).orElse(null);

    final PgPool pgPool = PgPool.pool(
        PgConnectOptions.fromUri(requireEnv("PLATFORM_DATABASE_URL").concat(requireEnv("PLATFORM_DATABASE_DB")))
            .setUser(requireEnv("PLATFORM_DATABASE_USERNAME"))
            .setPassword(requireEnv("PLATFORM_DATABASE_PASSWORD")),
        new PoolOptions()
            .setMaxSize(10)
    );

    final ReactiveClassicGenericQueryExecutor queryExecutor = new ReactiveClassicGenericQueryExecutor(
        new DefaultConfiguration().set(SQLDialect.POSTGRES),
        pgPool
    );

    final TransactionHandler hederaTransactionHandler = new TransactionHandler(
        hederaClient, hederaFixedNodeId, hederaOperatorId, hederaTopicId, hederaOperatorKey);

    final HederaIssueHandler hederaIssueHandler = new HederaIssueHandler(
        supplyManagerPrivateKey, hederaClient, hederaTopicId, hederaOperatorId.account);

    final HederaRegisterHandler hederaRegisterHandler = new HederaRegisterHandler(
        queryExecutor, complianceManagerPrivateKey, hederaClient, hederaTopicId, hederaOperatorId.account);

    final DismissFlagHandler dismissFlagHandler = new DismissFlagHandler(queryExecutor);

    public static void main(String[] args) {

        String postgresUrl = requireEnv("PLATFORM_DATABASE_URL");
        String postgresDatabase = requireEnv("PLATFORM_DATABASE_DB");
        String postgresUser = requireEnv("PLATFORM_DATABASE_USERNAME");
        String postgresPassword = requireEnv("PLATFORM_DATABASE_PASSWORD");

        Flyway flyway = Flyway
            .configure()
            .dataSource("jdbc:".concat(postgresUrl).concat(postgresDatabase), postgresUser, postgresPassword)
            .locations("classpath:migrations")
            .connectRetries(20)
            .load();
        flyway.migrate();

        Vertx.vertx().deployVerticle(
            PlatformVerticle.class.getName(),
            new DeploymentOptions().setInstances(16));
    }

    private static String requireEnv(String name) {
        return Objects.requireNonNull(env.get(name), "missing environment variable " + name);
    }

    @Override
    public void start(Promise<Void> startPromise) {
        var server = vertx.createHttpServer();
        var router = Router.router(vertx);

        final GetAllUserHandler getAllUserHandler;

        if ( ! env.get("ESC_NODE_URL","").isEmpty()) {
            Web3j web3j = Web3j.build(new HttpService(requireEnv("ESC_NODE_URL")));

            Credentials supplyManagerCredentials = Credentials.create(requireEnv("ESC_SUPPLY_MANAGER_KEY"));
            Credentials complianceManagerCredentials = Credentials.create(requireEnv("ESC_COMPLIANCE_MANAGER_KEY"));

            String ethereumContractAddress = requireEnv("ESC_CONTRACT_ADDRESS");

            EthereumIssueHandler ethereumIssueHandler = new EthereumIssueHandler(
                web3j, supplyManagerCredentials, ethereumContractAddress);

            EthereumRegisterHandler ethereumRegisterHandler = new EthereumRegisterHandler(
                queryExecutor, web3j, complianceManagerCredentials, supplyManagerCredentials, ethereumContractAddress);

            getAllUserHandler = new GetAllUserHandler(
                queryExecutor, hederaTopicId, ethereumContractAddress);

            router.post("/ethereum/user").handler(ethereumRegisterHandler);
            router.post("/ethereum/issue").handler(ethereumIssueHandler);

        } else {
            getAllUserHandler = new GetAllUserHandler(
                queryExecutor, hederaTopicId);
        }

        router.route()
            .handler(CorsHandler.create("*").allowedHeader("content-type"))
            .handler(BodyHandler.create())
            .failureHandler(this::failureHandler);

        router.get("/user").handler(getAllUserHandler);

        router.post("/flag/dismiss").handler(dismissFlagHandler);

        router.post("/hedera/user").handler(hederaRegisterHandler);
        router.post("/hedera/issue").handler(hederaIssueHandler);
        router.post("/hedera/transaction").handler(hederaTransactionHandler);
        System.out.println("Platform listening on port: " + httpPort);
        server
            .requestHandler(router)
            .listen(httpPort, result -> {
                if (result.succeeded()) {
                    startPromise.complete();
                } else {
                    startPromise.fail(result.cause());
                }
            });
    }

    private void failureHandler(RoutingContext routingContext) {
        var response = routingContext.response();

        // if we got into the failure handler the status code
        // has likely been populated
        if (routingContext.statusCode() > 0) {
            response.setStatusCode(routingContext.statusCode());
        }

        var cause = routingContext.failure();
        if (cause != null) {
            // TODO: use a logging platform to log the failure
            cause.printStackTrace();
            response.setStatusCode(500);
        }

        response.end();
    }
}
