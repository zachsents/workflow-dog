import { Kysely, PostgresDialect } from "kysely"
import { Pool } from "pg"
import type { DB } from "shared/db"
import { useEnvVar } from "./utils"

const dialect = new PostgresDialect({
    pool: new Pool({
        connectionString: useEnvVar("DATABASE_URL"),
        max: 10,
    })
})

export const db = new Kysely<DB>({ dialect })