#!/bin/bash

export DB_URL=$(bun --env-file=env/dev.env --env-file=env/.env -e 'console.log(`postgresql://${Bun.env.POSTGRES_USER || "postgres"}:${Bun.env.POSTGRES_PASSWORD}@localhost:${Bun.env.POSTGRES_PORT || 5432}/${Bun.env.POSTGRES_DB || "postgres"}`)')

cd services/db
bunx kysely "$@"