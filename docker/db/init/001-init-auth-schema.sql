CREATE SCHEMA auth;

CREATE TABLE IF NOT EXISTS
    auth.verification_tokens (
        identifier TEXT NOT NULL,
        expires TIMESTAMPTZ NOT NULL,
        token TEXT NOT NULL,
        PRIMARY KEY (identifier, token)
    );

CREATE TABLE IF NOT EXISTS
    auth.users (
        id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        "emailVerified" TIMESTAMPTZ,
        image TEXT
    );

CREATE TABLE IF NOT EXISTS
    auth.accounts (
        id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
        "userId" uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
        type VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL,
        "providerAccountId" VARCHAR(255) NOT NULL,
        refresh_token TEXT,
        access_token TEXT,
        expires_at BIGINT,
        id_token TEXT,
        scope TEXT,
        session_state TEXT,
        token_type TEXT
    );

CREATE TABLE IF NOT EXISTS
    auth.sessions (
        id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
        "userId" uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
        expires TIMESTAMPTZ NOT NULL,
        "sessionToken" VARCHAR(255) NOT NULL
    );