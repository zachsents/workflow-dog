#!/bin/bash

(
    # Wait for postgres to start
    while ! pg_isready -q -U postgres -h localhost; do
        echo "[WFD Migrations] Waiting for postgres to start..."
        sleep 1
    done
    
    # Wait for supertokens tables to be initialized
    while [ "$(psql -U postgres -h localhost -tq --no-align -c 'SELECT COUNT(*) > 32 FROM information_schema.tables WHERE table_schema = '\''auth'\')" = "f" ]; do
        echo "[WFD Migrations] Waiting for supertokens tables to be initialized..."
        sleep 1
    done
    echo "[WFD Migrations] Detected supertokens tables"
    sleep 1

    cd /wfd/db
    DB_URL="postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD}@localhost:${POSTGRES_PORT:-5432}/${POSTGRES_DB:-postgres}" ~/.bun/bin/bunx kysely migrate latest
    echo "[WFD Migrations] Finished"
) & 
echo "[WFD Migrations] Starting..."