import { sql, type Kysely } from "kysely"

/*
    This migration adds a trigger event type to the workflow table.
*/

export async function up(db: Kysely<any>): Promise<void> {
    // remove old trigger system
    await db.schema.alterTable("workflow_runs")
        .dropColumn("trigger_id")
        .execute()
    await db.schema.dropTable("triggers").ifExists().execute()

    // add new trigger system
    await db.schema.alterTable("workflows")
        .addColumn("trigger_event_type_id", "text", (col) => col.notNull().defaultTo("primitives/callable"))
        .execute()

    await db.schema.createTable("event_sources").ifNotExists()
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .execute()
    // todo: add event source columns

    await db.schema.createTable("workflows_event_sources")
        .addColumn("workflow_id", "uuid", (col) => col.notNull().references("workflows.id").onDelete("cascade"))
        .addColumn("event_source_id", "uuid", (col) => col.notNull().references("event_sources.id").onDelete("cascade"))
        .addPrimaryKeyConstraint("workflows_event_sources_pkey", ["workflow_id", "event_source_id"])
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    // remove new trigger system
    await db.schema.dropTable("workflows_event_sources").ifExists().execute()
    await db.schema.dropTable("event_sources").ifExists().execute()
    await db.schema.alterTable("workflows").dropColumn("trigger_event_type_id").execute()

    // re-add old trigger system
    await db.schema
        .createTable("triggers").ifNotExists()
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("workflow_id", "uuid", (col) => col.notNull().references("workflows.id").onDelete("cascade"))
        .addColumn("config", "jsonb", (col) => col.notNull().defaultTo("{}"))
        .addColumn("state", "jsonb", (col) => col.notNull().defaultTo("{}"))
        .addColumn("service_account_id", "uuid", (col) => col.references("service_accounts.id").onDelete("set null"))
        .addColumn("def_id", "text", (col) => col.notNull())
        .execute()

    await db.schema.alterTable("workflow_runs")
        .addColumn("trigger_id", "uuid", (col) => col.references("triggers.id"))
        .execute()
}