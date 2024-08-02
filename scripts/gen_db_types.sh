#!/bin/bash

PORT=$(bunx zenv -e dev get POSTGRES_PORT)
PASS=$(bunx zenv -e dev get POSTGRES_PASSWORD)
export DATABASE_URL="postgresql://postgres:$PASS@localhost:$PORT/postgres"

bunx kysely-codegen --out-file packages/core/db.ts --dialect postgres