package com.hedera.hashgraph.stablecoin.platform;

import com.google.common.io.BaseEncoding;
import io.vertx.core.buffer.Buffer;
import org.web3j.abi.datatypes.Address;

import javax.annotation.Nullable;
import java.math.BigInteger;
import java.time.OffsetDateTime;

public class User {
    public final String createdAt;

    public final String displayName;

    public final String address;

    public final String network;
    
    public final long id;

    @Nullable
    public final Short flagSeverity;

    @Nullable
    public final String flagAt;

    @Nullable
    public final String flagIgnoreAt;

    public User(
        OffsetDateTime createdAt, 
        String displayName, 
        Buffer publicKey, 
        long id, 
        String network,
        @Nullable Short flagSeverity,
        @Nullable OffsetDateTime flagAt,
        @Nullable OffsetDateTime flagIgnoreAt
    ) {
        this.createdAt = createdAt.toString();
        this.id = id;
        this.displayName = displayName;
        this.network = network;
        this.flagAt = flagAt == null ? null : flagAt.toString();
        this.flagIgnoreAt = flagIgnoreAt == null ? null : flagIgnoreAt.toString();
        this.flagSeverity = flagSeverity;

        if (network.startsWith("hedera:")) {
            this.address = BaseEncoding.base16().lowerCase().encode(publicKey.getBytes());
        } else if (network.startsWith("ethereum:")) {
            this.address = new Address(new BigInteger(publicKey.getBytes())).toString();
        } else {
            throw new IllegalStateException("unexpected value for network: " + network);
        }
    }
}
