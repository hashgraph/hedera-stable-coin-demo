CREATE TABLE account
(
    id              BIGSERIAL PRIMARY KEY,
    created_at      TIMESTAMPTZ NOT NULL                                       DEFAULT now(),

    display_name    TEXT        NOT NULL,

    -- 1 = Hedera
    -- 2 = Ethereum
    network         INT2        NOT NULL,

    address         BYTEA       NOT NULL,

    -- NULL    -> no flag
    -- 1 ..= 3 -> flag severity (higher is worse)
    flag            SMALLINT CHECK (flag IS NULL or (flag >= 1 and flag <= 3)) DEFAULT (
        CASE
            WHEN RANDOM() > 0.4 THEN 1
            WHEN RANDOM() > 0.7 THEN 2
            WHEN RANDOM() > 0.9 THEN 3
            ELSE NULL
            END
        ),

    flag_at         TIMESTAMPTZ DEFAULT NOW(),
    flag_ignored_at TIMESTAMPTZ
);
