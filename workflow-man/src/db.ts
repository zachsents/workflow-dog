import { Kysely, PostgresDialect } from "kysely"
import { Pool } from "pg"
import type { DB } from "shared/db"

if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL not set")

export const db = new Kysely<DB>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: process.env.DATABASE_URL,
            max: 10,
        })
    })
})
