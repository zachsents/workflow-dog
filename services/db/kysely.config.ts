import { PostgresDialect } from "kysely"
import { defineConfig } from "kysely-ctl"
import { Pool } from "pg"

export default defineConfig({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: process.env.EXTERNAL_DATABASE_URL,
            max: 10,
        })
    }),
    migrations: {
        migrationFolder: "migrations",
    },
    plugins: [],
})
