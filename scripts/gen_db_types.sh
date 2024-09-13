#!/bin/bash

PORT=$(bunx zenv -e dev get POSTGRES_PORT)
DB=$(bunx zenv -e dev get POSTGRES_DB)
USER=$(bunx zenv -e dev get POSTGRES_USER)
PASS=$(bunx zenv -e dev get POSTGRES_PASSWORD)
export DATABASE_URL="postgresql://${USER:-postgres}:$PASS@localhost:${PORT:-5432}/${DB:-postgres}"

bunx kysely-codegen --out-file packages/core/db.ts --dialect postgres