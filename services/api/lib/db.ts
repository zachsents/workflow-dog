import { Kysely, PostgresDialect } from "kysely"
import { Pool } from "pg"
import type { DB } from "core/db"
import { useEnvVar } from "./utils"

export const db = new Kysely<DB>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: useEnvVar("DATABASE_URL"),
            max: 10,
        }),
    })
})