#!/bin/bash

export DATABASE_URL=$(bun --env-file=env/dev.env --env-file=env/.env -e 'console.log(`postgresql://${Bun.env.POSTGRES_USER || "postgres"}:${Bun.env.POSTGRES_PASSWORD}@localhost:${Bun.env.POSTGRES_PORT || 5432}/${Bun.env.POSTGRES_DB || "postgres"}`)')

bunx kysely-codegen --out-file packages/core/db.ts --dialect postgres