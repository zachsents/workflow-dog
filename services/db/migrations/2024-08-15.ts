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
        .addColumn("project_id", "uuid", (col) => col.notNull().references("projects.id").onDelete("cascade"))
        .addColumn("name", "text", (col) => col.notNull().defaultTo("Untitled Workflow"))
        .addColumn("is_enabled", "boolean", (col) => col.notNull().defaultTo(false))
        .addColumn("graph", "text", (col) => col.notNull().defaultTo('{"json":{"nodes":[],"edges":[]}}'))
        .addColumn("trigger_event_type_id", "text", (col) => col.notNull().defaultTo("eventType:primitives/callable"))
        .addColumn("trigger_config", "jsonb", (col) => col.notNull().defaultTo("{}"))
        .addColumn("last_edited_at", "timestamptz")
        .addColumn("last_save_client_timestamp", "timestamptz")
        .execute()

    await db.schema.createTable("workflow_snapshots").ifNotExists()
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("workflow_id", "uuid", (col) => col.notNull().references("workflows.id").onDelete("cascade"))
        .addColumn("graph", "text", (col) => col.notNull().defaultTo('{"json":{"nodes":[],"edges":[]}}'))
        .addColumn("trigger_event_type_id", "text", (col) => col.notNull())
        .execute()

    await db.schema.createTable("event_sources").ifNotExists()
        .addColumn("id", "text", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("definition_id", "text", col => col.notNull())
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("enabled_event_types", sql`text[]`, (col) => col.notNull().defaultTo(sql`ARRAY[]::text[]`))
        .addColumn("state", "jsonb", (col) => col.notNull().defaultTo("{}"))
        .execute()

    await db.schema.createTable("workflows_event_sources").ifNotExists()
        .addColumn("workflow_id", "uuid", (col) => col.notNull().references("workflows.id").onDelete("cascade"))
        .addColumn("event_source_id", "text", (col) => col.notNull().references("event_sources.id").onDelete("cascade"))
        .addPrimaryKeyConstraint("workflows_event_sources_pkey", ["workflow_id", "event_source_id"])
        .execute()

    await db.schema.createTable("workflow_runs").ifNotExists()
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        // if a workflow is deleted, we still want the run to exist for usage tracking
        .addColumn("project_id", "uuid", (col) => col.references("projects.id").onDelete("cascade"))
        .addColumn("workflow_id", "uuid", (col) => col.references("workflows.id").onDelete("set null"))
        .addColumn("snapshot_id", "uuid", (col) => col.references("workflow_snapshots.id").onDelete("set null"))
        .addColumn("status", sql`public.workflow_run_status`, (col) => col.notNull().defaultTo("pending"))
        .addColumn("event_payload", "jsonb", (col) => col.notNull().defaultTo("{}"))
        .addColumn("node_errors", "jsonb", (col) => col.notNull().defaultTo("{}"))
        .addColumn("global_error", "jsonb")
        // -v- computed in trigger -v-
        .addColumn("error_count", "integer", col => col.notNull().defaultTo(0))
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

    /**
     * Trigger - on workflow update
     *  - Updates last edited timestamp
     */
    await sql`
    CREATE OR REPLACE FUNCTION public.workflows_on_update()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.graph IS DISTINCT FROM OLD.graph OR NEW.trigger_config IS DISTINCT FROM OLD.trigger_config THEN
            NEW.last_edited_at := now();
        END IF;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_workflows_on_update
    BEFORE UPDATE ON public.workflows
    FOR EACH ROW
    EXECUTE FUNCTION public.workflows_on_update();
    `.execute(db)

    /**
     * Trigger - on workflow run insert
     *  - Adds project ID
     *  - Either links to existing snapshot or creates a new one
     */
    await sql`
    CREATE OR REPLACE FUNCTION public.workflow_runs_on_insert()
    RETURNS TRIGGER AS $$
    DECLARE
        _project_id uuid;
        _existing_snapshot_id uuid;
    BEGIN
        SELECT project_id INTO _project_id
        FROM workflows
        WHERE id = NEW.workflow_id;

        NEW.project_id := _project_id;

        SELECT snap.id INTO _existing_snapshot_id
        FROM workflow_snapshots snap
        LEFT JOIN workflows wf ON snap.workflow_id = wf.id
        WHERE (
            wf.id = NEW.workflow_id
            AND snap.graph = wf.graph
            AND snap.trigger_event_type_id = wf.trigger_event_type_id
        );

        IF _existing_snapshot_id IS NULL THEN
            INSERT INTO workflow_snapshots (workflow_id, graph, trigger_event_type_id)
            SELECT id, graph, trigger_event_type_id
            FROM workflows
            WHERE id = NEW.workflow_id
            RETURNING id INTO _existing_snapshot_id;
        END IF;

        NEW.snapshot_id := _existing_snapshot_id;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_workflow_runs_on_insert
    BEFORE INSERT ON public.workflow_runs
    FOR EACH ROW
    EXECUTE FUNCTION public.workflow_runs_on_insert();
    `.execute(db)

    /**
     * Trigger - on workflow run update
     *  - Updates error counts
     */
    await sql`
    CREATE OR REPLACE FUNCTION public.workflow_runs_on_update()
    RETURNS TRIGGER AS $$
    DECLARE
        _error_count int;
    BEGIN
        IF NEW.node_errors IS DISTINCT FROM OLD.node_errors OR NEW.global_error IS DISTINCT FROM OLD.global_error THEN
            SELECT 
                count(node_error_keys) + (NEW.global_error is not null)::int
            INTO _error_count
            FROM jsonb_object_keys(NEW.node_errors) as node_error_keys;

            NEW.error_count := _error_count;
        END IF;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_workflow_runs_on_update
    BEFORE UPDATE ON public.workflow_runs
    FOR EACH ROW
    EXECUTE FUNCTION public.workflow_runs_on_update();
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
    await sql`DROP FUNCTION IF EXISTS public.workflows_on_update`.execute(db)
    await sql`DROP FUNCTION IF EXISTS public.workflow_runs_on_insert`.execute(db)
    await sql`DROP FUNCTION IF EXISTS public.workflow_runs_on_update`.execute(db)

    // Drop custom types
    await db.schema.dropType("workflow_run_status").ifExists().execute()
    await db.schema.dropType("project_permission").ifExists().execute()
    await db.schema.dropType("billing_plan").ifExists().execute()
}