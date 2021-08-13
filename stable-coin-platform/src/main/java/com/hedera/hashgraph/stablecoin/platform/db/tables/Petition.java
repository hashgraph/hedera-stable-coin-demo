/*
 * This file is generated by jOOQ.
 */
package com.hedera.hashgraph.stablecoin.platform.db.tables;


import com.hedera.hashgraph.stablecoin.platform.db.Keys;
import com.hedera.hashgraph.stablecoin.platform.db.Public;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.List;

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
import org.jooq.impl.TableImpl;


/**
 * This class is generated by jOOQ.
 */
@SuppressWarnings({ "all", "unchecked", "rawtypes" })
public class Petition extends TableImpl<Record> {

    private static final long serialVersionUID = 607257598;

    /**
     * The reference instance of <code>public.petition</code>
     */
    public static final Petition PETITION = new Petition();

    /**
     * The class holding records for this type
     */
    @Override
    public Class<Record> getRecordType() {
        return Record.class;
    }

    /**
     * The column <code>public.petition.id</code>.
     */
    public final TableField<Record, Long> ID = createField(DSL.name("id"), org.jooq.impl.SQLDataType.BIGINT.nullable(false).defaultValue(org.jooq.impl.DSL.field("nextval('petition_id_seq'::regclass)", org.jooq.impl.SQLDataType.BIGINT)), this, "");

    /**
     * The column <code>public.petition.created_at</code>.
     */
    public final TableField<Record, OffsetDateTime> CREATED_AT = createField(DSL.name("created_at"), org.jooq.impl.SQLDataType.TIMESTAMPWITHTIMEZONE.nullable(false).defaultValue(org.jooq.impl.DSL.field("now()", org.jooq.impl.SQLDataType.TIMESTAMPWITHTIMEZONE)), this, "");

    /**
     * The column <code>public.petition.text</code>.
     */
    public final TableField<Record, String> TEXT = createField(DSL.name("text"), org.jooq.impl.SQLDataType.CLOB.nullable(false), this, "");

    /**
     * The column <code>public.petition.account_id</code>.
     */
    public final TableField<Record, Long> ACCOUNT_ID = createField(DSL.name("account_id"), org.jooq.impl.SQLDataType.BIGINT.nullable(false), this, "");

    /**
     * Create a <code>public.petition</code> table reference
     */
    public Petition() {
        this(DSL.name("petition"), null);
    }

    /**
     * Create an aliased <code>public.petition</code> table reference
     */
    public Petition(String alias) {
        this(DSL.name(alias), PETITION);
    }

    /**
     * Create an aliased <code>public.petition</code> table reference
     */
    public Petition(Name alias) {
        this(alias, PETITION);
    }

    private Petition(Name alias, Table<Record> aliased) {
        this(alias, aliased, null);
    }

    private Petition(Name alias, Table<Record> aliased, Field<?>[] parameters) {
        super(alias, null, aliased, parameters, DSL.comment(""), TableOptions.table());
    }

    public <O extends Record> Petition(Table<O> child, ForeignKey<O, Record> key) {
        super(child, key, PETITION);
    }

    @Override
    public Schema getSchema() {
        return Public.PUBLIC;
    }

    @Override
    public Identity<Record, Long> getIdentity() {
        return Keys.IDENTITY_PETITION;
    }

    @Override
    public UniqueKey<Record> getPrimaryKey() {
        return Keys.PETITION_PKEY;
    }

    @Override
    public List<UniqueKey<Record>> getKeys() {
        return Arrays.<UniqueKey<Record>>asList(Keys.PETITION_PKEY);
    }

    @Override
    public List<ForeignKey<Record, ?>> getReferences() {
        return Arrays.<ForeignKey<Record, ?>>asList(Keys.PETITION__PETITION_ACCOUNT_ID_FKEY);
    }

    public Account account() {
        return new Account(this, Keys.PETITION__PETITION_ACCOUNT_ID_FKEY);
    }

    @Override
    public Petition as(String alias) {
        return new Petition(DSL.name(alias), this);
    }

    @Override
    public Petition as(Name alias) {
        return new Petition(alias, this);
    }

    /**
     * Rename this table
     */
    @Override
    public Petition rename(String name) {
        return new Petition(DSL.name(name), null);
    }

    /**
     * Rename this table
     */
    @Override
    public Petition rename(Name name) {
        return new Petition(name, null);
    }
}
