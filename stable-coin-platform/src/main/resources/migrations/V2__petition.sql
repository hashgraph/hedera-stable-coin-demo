CREATE TABLE petition
(
    id         BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    text       TEXT        NOT NULL,

    account_id BIGINT      NOT NULL REFERENCES account (id)
);
