import { Kysely, sql } from "kysely"
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
    CREATE OR REPLACE FUNCTION public.create_numeric_id_for_workflow_run()
    RETURNS TRIGGER AS $$
    DECLARE
        run_count int;
    BEGIN
        WITH tmp AS (
            SELECT
                wr.id,
                row_number() OVER (
                    ORDER BY
                        wr.created_at
                )
            FROM
                workflow_runs wr
            WHERE
                wr.workflow_id = NEW.workflow_id
        )
        SELECT
            row_number INTO run_count
        FROM
            tmp
        WHERE
            tmp.id = NEW.id;

        UPDATE
            workflow_runs
        SET
            numeric_id = run_count
        WHERE
            id = NEW.id;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `.execute(db)

    // Create tables
    await db.schema
        .createTable("user_meta")
        // .addColumn("id", "uuid", (col) => col.primaryKey().references("auth.users.id").onDelete("cascade"))
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("name", "text")
        .addColumn("first_name", "text")
        .addColumn("last_name", "text")
        .addColumn("picture", "text")
        // .addColumn("personal_project_id", "uuid", (col) => col.references("projects.id").onDelete("set null"))
        .execute()

    await db.schema
        .createTable("projects")
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("creator", "uuid", (col) => col.references("user_meta.id").onDelete("set null"))
        .addColumn("is_personal", "boolean", (col) => col.notNull().defaultTo(false))
        .addColumn("name", "text", (col) => col.notNull().defaultTo("Untitled Project"))
        .addColumn("billing_plan", sql`public.billing_plan`)
        .addColumn("billing_start_date", "date", (col) => col.defaultTo(sql`CURRENT_DATE`))
        .execute()

    await db.schema
        .createTable("project_invitations")
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("project_id", "uuid", (col) => col.notNull().references("projects.id").onDelete("cascade"))
        .addColumn("invitee_email", "text", (col) => col.notNull())
        .execute()

    await db.schema
        .createTable("projects_users")
        .addColumn("project_id", "uuid", (col) => col.notNull().references("projects.id").onDelete("cascade"))
        .addColumn("user_id", "uuid", (col) => col.notNull().references("user_meta.id").onDelete("cascade"))
        .addColumn("permissions", sql`public.project_permission[]`, (col) =>
            col.notNull().defaultTo(sql`ARRAY['read', 'write']::public.project_permission[]`)
        )
        .addPrimaryKeyConstraint("projects_users_pkey", ["project_id", "user_id"])
        .execute()

    await db.schema
        .createTable("service_accounts")
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("service_def_id", "text")
        .addColumn("service_user_id", "text")
        .addColumn("display_name", "text")
        .addColumn("refresh_token", "text")
        .addColumn("profile", "jsonb")
        .addColumn("scopes", sql`text[]`)
        .addColumn("creator", "uuid", (col) => col.references("user_meta.id").onDelete("set null"))
        .addColumn("encrypted_token", "text", (col) => col.notNull())
        .addUniqueConstraint("service_accounts_service_def_id_service_user_id_unique", ["service_def_id", "service_user_id"])
        .execute()

    await db.schema
        .createTable("projects_service_accounts")
        .addColumn("project_id", "uuid", (col) => col.notNull().references("projects.id").onDelete("cascade"))
        .addColumn("service_account_id", "uuid", (col) => col.notNull().references("service_accounts.id").onDelete("cascade"))
        .addPrimaryKeyConstraint("projects_service_accounts_pkey", ["project_id", "service_account_id"])
        .execute()

    await db.schema
        .createTable("workflows")
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("creator", "uuid", (col) => col.references("user_meta.id").onDelete("set null"))
        .addColumn("is_enabled", "boolean", (col) => col.notNull().defaultTo(false))
        .addColumn("name", "text", (col) => col.defaultTo("Untitled Workflow"))
        .addColumn("project_id", "uuid", (col) => col.references("projects.id").onDelete("cascade"))
        .addColumn("last_edited_at", "timestamptz")
        .addColumn("last_ran_at", "timestamptz")
        .addColumn("current_graph_id", "uuid")
        .execute()

    await db.schema
        .createTable("workflow_graphs")
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("workflow_id", "uuid", (col) => col.references("workflows.id").onDelete("cascade"))
        .addColumn("nodes", "jsonb", (col) => col.notNull().defaultTo("[]"))
        .addColumn("edges", "jsonb", (col) => col.notNull().defaultTo("[]"))
        .execute()

    await db.schema
        .alterTable("workflows")
        .addForeignKeyConstraint("public_workflows_graph_fkey", ["current_graph_id"], "workflow_graphs", ["id"])
        .onDelete("set null")
        .execute()

    await db.schema
        .createTable("triggers")
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("workflow_id", "uuid", (col) => col.notNull().references("workflows.id").onDelete("cascade"))
        .addColumn("config", "jsonb", (col) => col.notNull().defaultTo("{}"))
        .addColumn("state", "jsonb", (col) => col.notNull().defaultTo("{}"))
        .addColumn("service_account_id", "uuid", (col) => col.references("service_accounts.id").onDelete("set null"))
        .addColumn("def_id", "text", (col) => col.notNull())
        .execute()

    await db.schema
        .createTable("workflow_runs")
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("workflow_id", "uuid", (col) => col.notNull().references("workflows.id").onDelete("cascade"))
        .addColumn("trigger_id", "uuid", (col) => col.references("triggers.id"))
        .addColumn("workflow_graph_id", "uuid", (col) => col.notNull().references("workflow_graphs.id"))
        .addColumn("status", sql`public.workflow_run_status`, (col) => col.notNull().defaultTo("pending"))
        .addColumn("numeric_id", "integer")
        .addColumn("node_outputs", "jsonb", (col) => col.notNull().defaultTo("{}"))
        .addColumn("node_errors", "jsonb", (col) => col.notNull().defaultTo("{}"))
        .addColumn("global_outputs", "jsonb", (col) => col.notNull().defaultTo("{}"))
        .addColumn("global_errors", "jsonb", (col) => col.notNull().defaultTo("[]"))
        .addColumn("trigger_payload", "jsonb", (col) => col.notNull().defaultTo("{}"))
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("started_at", "timestamptz")
        .addColumn("finished_at", "timestamptz")
        .addColumn("scheduled_for", "timestamptz")
        .execute()

    await db.schema
        .createTable("workflow_run_node_outputs")
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn("workflow_run_id", "uuid", (col) => col.notNull().references("workflow_runs.id").onDelete("cascade"))
        .addColumn("node_id", "text", (col) => col.notNull())
        .addColumn("handle_id", "text", (col) => col.notNull())
        .addColumn("type_meta_id", "text")
        .addColumn("value", "jsonb")
        .execute()

    await db.schema
        .createTable("workflows_usage_records")
        .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("workflow_id", "uuid", (col) => col.notNull().references("workflows.id"))
        .addColumn("billing_period_id", "text", (col) => col.notNull())
        .addColumn("run_count", "integer", (col) => col.notNull().defaultTo(0))
        .addUniqueConstraint("workflows_usage_records_billing_period_id_workflow_id_unique", ["billing_period_id", "workflow_id"])
        .execute()

    // Create trigger
    await sql`
        CREATE TRIGGER trigger_create_numeric_id_for_workflow_run
        AFTER INSERT ON public.workflow_runs
        FOR EACH ROW
        EXECUTE FUNCTION public.create_numeric_id_for_workflow_run();
      `.execute(db)

    // Enable row level security
    await sql`ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.projects_users ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.service_accounts ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.projects_service_accounts ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.workflow_graphs ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.triggers ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.workflow_run_node_outputs ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.workflows_usage_records ENABLE ROW LEVEL SECURITY`.execute(db)
    await sql`ALTER TABLE public.user_meta ENABLE ROW LEVEL SECURITY`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {
    // Drop tables in reverse order
    await db.schema.dropTable("workflows_usage_records").ifExists().execute()
    await db.schema.dropTable("workflow_run_node_outputs").ifExists().execute()
    await db.schema.dropTable("workflow_runs").ifExists().execute()
    await db.schema.dropTable("triggers").ifExists().execute()
    await db.schema.alterTable("workflows").dropConstraint("public_workflows_graph_fkey")
        .ifExists().execute()
    await db.schema.dropTable("workflow_graphs").ifExists().execute()
    await db.schema.dropTable("workflows").ifExists().execute()
    await db.schema.dropTable("projects_service_accounts").ifExists().execute()
    await db.schema.dropTable("service_accounts").ifExists().execute()
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