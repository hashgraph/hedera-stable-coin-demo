/*
 * This file is generated by jOOQ.
 */
package com.hedera.hashgraph.stablecoin.platform.db.tables;


import com.hedera.hashgraph.stablecoin.platform.db.Keys;
import com.hedera.hashgraph.stablecoin.platform.db.Public;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;

import org.jooq.Check;
import org.jooq.Field;
import org.jooq.ForeignKey;
import org.jooq.Identity;
import org.jooq.Name;
import org.jooq.Record;
import org.jooq.Schema;
import org.jooq.Table;
import org.jooq.TableField;
import org.jooq.TableOptions;
import org.jooq.UniqueKey;
import org.jooq.impl.DSL;
import org.jooq.impl.Internal;
import org.jooq.impl.TableImpl;


/**
 * This class is generated by jOOQ.
 */
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class Account extends TableImpl<Record> {

    private static final long serialVersionUID = 217194149;

    /**
     * The reference instance of <code>public.account</code>
     */
    public static final Account ACCOUNT = new Account();

    /**
     * The class holding records for this type
     */
    @Override
    public Class<Record> getRecordType() {
        return Record.class;
    }

    /**
     * The column <code>public.account.id</code>.
     */
    public final TableField<Record, Long> ID = createField(DSL.name("id"), org.jooq.impl.SQLDataType.BIGINT.nullable(false).defaultValue(org.jooq.impl.DSL.field("nextval('account_id_seq'::regclass)", org.jooq.impl.SQLDataType.BIGINT)), this, "");

    /**
     * The column <code>public.account.created_at</code>.
     */
    public final TableField<Record, OffsetDateTime> CREATED_AT = createField(DSL.name("created_at"), org.jooq.impl.SQLDataType.TIMESTAMPWITHTIMEZONE.nullable(false).defaultValue(org.jooq.impl.DSL.field("now()", org.jooq.impl.SQLDataType.TIMESTAMPWITHTIMEZONE)), this, "");

    /**
     * The column <code>public.account.display_name</code>.
     */
    public final TableField<Record, String> DISPLAY_NAME = createField(DSL.name("display_name"), org.jooq.impl.SQLDataType.CLOB.nullable(false), this, "");

    /**
     * The column <code>public.account.network</code>.
     */
    public final TableField<Record, Short> NETWORK = createField(DSL.name("network"), org.jooq.impl.SQLDataType.SMALLINT.nullable(false), this, "");

    /**
     * The column <code>public.account.address</code>.
     */
    public final TableField<Record, byte[]> ADDRESS = createField(DSL.name("address"), org.jooq.impl.SQLDataType.BLOB.nullable(false), this, "");

    /**
     * The column <code>public.account.flag</code>.
     */
    public final TableField<Record, Short> FLAG = createField(DSL.name("flag"), org.jooq.impl.SQLDataType.SMALLINT.defaultValue(org.jooq.impl.DSL.field("\nCASE\n    WHEN (random() > (0.4)::double precision) THEN 1\n    WHEN (random() > (0.7)::double precision) THEN 2\n    WHEN (random() > (0.9)::double precision) THEN 3\n    ELSE NULL::integer\nEND", org.jooq.impl.SQLDataType.SMALLINT)), this, "");

    /**
     * The column <code>public.account.flag_at</code>.
     */
    public final TableField<Record, OffsetDateTime> FLAG_AT = createField(DSL.name("flag_at"), org.jooq.impl.SQLDataType.TIMESTAMPWITHTIMEZONE.defaultValue(org.jooq.impl.DSL.field("now()", org.jooq.impl.SQLDataType.TIMESTAMPWITHTIMEZONE)), this, "");

    /**
     * The column <code>public.account.flag_ignored_at</code>.
     */
    public final TableField<Record, OffsetDateTime> FLAG_IGNORED_AT = createField(DSL.name("flag_ignored_at"), org.jooq.impl.SQLDataType.TIMESTAMPWITHTIMEZONE, this, "");

    /**
     * Create a <code>public.account</code> table reference
     */
    public Account() {
        this(DSL.name("account"), null);
    }

    /**
     * Create an aliased <code>public.account</code> table reference
     */
    public Account(String alias) {
        this(DSL.name(alias), ACCOUNT);
    }

    /**
     * Create an aliased <code>public.account</code> table reference
     */
    public Account(Name alias) {
        this(alias, ACCOUNT);
    }

    private Account(Name alias, Table<Record> aliased) {
        this(alias, aliased, null);
    }

    private Account(Name alias, Table<Record> aliased, Field<?>[] parameters) {
        super(alias, null, aliased, parameters, DSL.comment(""), TableOptions.table());
    }

    public <O extends Record> Account(Table<O> child, ForeignKey<O, Record> key) {
        super(child, key, ACCOUNT);
    }

    @Override
    public Schema getSchema() {
        return Public.PUBLIC;
    }

    @Override
    public Identity<Record, Long> getIdentity() {
        return Keys.IDENTITY_ACCOUNT;
    }

    @Override
    public UniqueKey<Record> getPrimaryKey() {
        return Keys.ACCOUNT_PKEY;
    }

    @Override
    public List<UniqueKey<Record>> getKeys() {
        return Arrays.<UniqueKey<Record>>asList(Keys.ACCOUNT_PKEY);
    }

    @Override
    public List<Check<Record>> getChecks() {
        return Arrays.<Check<Record>>asList(
              Internal.createCheck(this, DSL.name("account_flag_check"), "(((flag IS NULL) OR ((flag >= 1) AND (flag <= 3))))", true)
        );
    }

    @Override
    public Account as(String alias) {
        return new Account(DSL.name(alias), this);
    }

    @Override
    public Account as(Name alias) {
        return new Account(alias, this);
    }

    /**
     * Rename this table
     */
    @Override
    public Account rename(String name) {
        return new Account(DSL.name(name), null);
    }

    /**
     * Rename this table
     */
    @Override
    public Account rename(Name name) {
        return new Account(name, null);
    }
}
