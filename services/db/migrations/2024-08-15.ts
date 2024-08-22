import { type Kysely, sql } from "kysely"
import { createTypeIfNotExists } from "../utils"

export async function up(db: Kysely<any>): Promise<void> {

    // Create custom types
    createTypeIfNotExists(db, "billing_plan", ["pro"])
    createTypeIfNotExists(db, "project_permission", ["read", "write"])
    createTypeIfNotExists(db, "workflow_run_status", [
        "pending", "scheduled", "cancelled",
        "completed", "failed", "running",
    ])

    // Create function
    await sql`
    CREATE OR REPLACE FUNCTION public.populate_workflow_run_info()
    RETURNS TRIGGER AS $$
    DECLARE
        _numeric_id int;
        _project_id uuid;
    BEGIN
        WITH tmp AS (
            SELECT wr.id, row_number() OVER ( ORDER BY wr.created_at )
            FROM workflow_runs wr
            WHERE wr.workflow_id = NEW.workflow_id
        )
        SELECT row_number INTO _numeric_id
        FROM tmp
        WHERE tmp.id = NEW.id;

        SELECT project_id INTO _project_id
        FROM workflows
        WHERE id = NEW.workflow_id;

        UPDATE workflow_runs
        SET numeric_id = _numeric_id, project_id = _project_id
        WHERE id = NEW.id;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    `.execute(db)

    // Create tables
    await db.schema.createTable("user_meta").ifNotExists()
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("name", "text")
        .addColumn("email", "text")
        .addColumn("first_name", "text")
        .addColumn("last_name", "text")
        .addColumn("picture", "text")
        .execute()

    await db.schema.createTable("projects").ifNotExists()
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("creator", "uuid", (col) => col.references("user_meta.id").onDelete("set null"))
        .addColumn("name", "text", (col) => col.notNull().defaultTo("Untitled Project"))
        .addColumn("billing_plan", sql`public.billing_plan`)
        .addColumn("billing_start_date", "date", (col) => col.defaultTo(sql`CURRENT_DATE`))
        .execute()

    await db.schema.createTable("project_invitations").ifNotExists()
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("project_id", "uuid", (col) => col.notNull().references("projects.id").onDelete("cascade"))
        .addColumn("invitee_email", "text", (col) => col.notNull())
        .execute()

    await db.schema.createTable("projects_users").ifNotExists()
        .addColumn("project_id", "uuid", (col) => col.notNull().references("projects.id").onDelete("cascade"))
        .addColumn("user_id", "uuid", (col) => col.notNull().references("user_meta.id").onDelete("cascade"))
        .addColumn("permissions", sql`public.project_permission[]`, (col) =>
            col.notNull().defaultTo(sql`ARRAY['read', 'write']::public.project_permission[]`)
        )
        .addPrimaryKeyConstraint("projects_users_pkey", ["project_id", "user_id"])
        .execute()

    await db.schema.createTable("third_party_accounts").ifNotExists()
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("provider_id", "text", col => col.notNull())
        .addColumn("provider_user_id", "text", col => col.notNull())
        .addColumn("display_name", "text", col => col.notNull())
        .addColumn("encrypted_auth_data", "text", col => col.notNull())
        .addColumn("scopes", sql`text[]`, col => col.notNull().defaultTo(sql`ARRAY[]::text[]`))
        .addUniqueConstraint("third_party_accounts_unqiue_provider_user", ["provider_id", "provider_user_id"])
        .execute()

    await db.schema.createTable("projects_third_party_accounts").ifNotExists()
        .addColumn("project_id", "uuid", (col) => col.notNull().references("projects.id").onDelete("cascade"))
        .addColumn("third_party_account_id", "uuid", (col) => col.notNull().references("third_party_accounts.id").onDelete("cascade"))
        .addPrimaryKeyConstraint("projects_third_party_accounts_pkey", ["project_id", "third_party_account_id"])
        .execute()

    await db.schema.createTable("workflows").ifNotExists()
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("creator", "uuid", (col) => col.references("user_meta.id").onDelete("set null"))
        .addColumn("project_id", "uuid", (col) => col.references("projects.id").onDelete("cascade"))
        .addColumn("name", "text", (col) => col.notNull().defaultTo("Untitled Workflow"))
        .addColumn("is_enabled", "boolean", (col) => col.notNull().defaultTo(false))
        .addColumn("graph", "text", (col) => col.notNull().defaultTo('{"json":{"nodes":[],"edges":[]}}'))
        .addColumn("trigger_event_type_id", "text", (col) => col.notNull().defaultTo("primitives/callable"))
        .addColumn("trigger_config", "jsonb", (col) => col.notNull().defaultTo("{}"))
        .addColumn("last_edited_at", "timestamptz")
        .addColumn("last_ran_at", "timestamptz")
        .execute()

    await db.schema.createTable("workflow_snapshots").ifNotExists()
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("workflow_id", "uuid", (col) => col.notNull().references("workflows.id").onDelete("cascade"))
        .addColumn("graph", "text", (col) => col.notNull().defaultTo('{"json":{"nodes":[],"edges":[]}}'))
        .addColumn("trigger_event_type_id", "text", (col) => col.notNull().defaultTo("primitives/callable"))
        .execute()

    await db.schema.createTable("event_sources").ifNotExists()
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("state", "jsonb", (col) => col.notNull().defaultTo("{}"))
        .execute()

    await db.schema.createTable("workflows_event_sources").ifNotExists()
        .addColumn("workflow_id", "uuid", (col) => col.notNull().references("workflows.id").onDelete("cascade"))
        .addColumn("event_source_id", "uuid", (col) => col.notNull().references("event_sources.id").onDelete("cascade"))
        .addPrimaryKeyConstraint("workflows_event_sources_pkey", ["workflow_id", "event_source_id"])
        .execute()

    await db.schema.createTable("workflow_runs").ifNotExists()
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("numeric_id", "integer")
        // if a workflow is deleted, we still want the run to exist for usage tracking
        .addColumn("project_id", "uuid", (col) => col.references("projects.id").onDelete("cascade"))
        .addColumn("workflow_id", "uuid", (col) => col.references("workflows.id").onDelete("set null"))
        .addColumn("snapshot_id", "uuid", (col) => col.notNull().references("workflow_snapshots.id"))
        .addColumn("status", sql`public.workflow_run_status`, (col) => col.notNull().defaultTo("pending"))
        .addColumn("event_payload", "jsonb", (col) => col.notNull().defaultTo("{}"))
        .addColumn("node_errors", "jsonb", (col) => col.notNull().defaultTo("{}"))
        .addColumn("global_error", "jsonb")
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("started_at", "timestamptz")
        .addColumn("finished_at", "timestamptz")
        .addColumn("scheduled_for", "timestamptz")
        .execute()

    await db.schema
        .createTable("workflow_run_outputs").ifNotExists()
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("workflow_run_id", "uuid", (col) => col.notNull().references("workflow_runs.id").onDelete("cascade"))
        .addColumn("is_global", "boolean", (col) => col.notNull().defaultTo(false))
        .addColumn("node_id", "text")
        .addColumn("handle_id", "text")
        .addColumn("value_type", "jsonb")
        .addColumn("value", "jsonb", (col) => col.notNull())
        .execute()

    // Create trigger that creates a numeric ID for a workflow run
    await sql`
    CREATE TRIGGER trigger_populate_workflow_run_info
    AFTER INSERT ON public.workflow_runs
    FOR EACH ROW
    EXECUTE FUNCTION public.populate_workflow_run_info();
    `.execute(db)

    // Enable row level security
    await sql`ALTER TABLE public.user_meta ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.projects_users ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.third_party_accounts ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.projects_third_party_accounts ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.workflow_snapshots ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.event_sources ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.workflows_event_sources ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.workflow_run_outputs ENABLE ROW LEVEL SECURITY`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
    // Drop tables in reverse order
    await db.schema.dropTable("workflow_run_outputs").ifExists().execute()
    await db.schema.dropTable("workflow_runs").ifExists().execute()
    await db.schema.dropTable("workflows_event_sources").ifExists().execute()
    await db.schema.dropTable("event_sources").ifExists().execute()
    await db.schema.dropTable("workflow_snapshots").ifExists().execute()
    await db.schema.dropTable("workflows").ifExists().execute()
    await db.schema.dropTable("projects_third_party_accounts").ifExists().execute()
    await db.schema.dropTable("third_party_accounts").ifExists().execute()
    await db.schema.dropTable("projects_users").ifExists().execute()
    await db.schema.dropTable("project_invitations").ifExists().execute()
    await db.schema.dropTable("projects").ifExists().execute()
    await db.schema.dropTable("user_meta").ifExists().execute()

    // Drop function
    await sql`DROP FUNCTION IF EXISTS public.create_numeric_id_for_workflow_run`.execute(db)

    // Drop custom types
    await db.schema.dropType("workflow_run_status").ifExists().execute()
    await db.schema.dropType("project_permission").ifExists().execute()
    await db.schema.dropType("billing_plan").ifExists().execute()
}