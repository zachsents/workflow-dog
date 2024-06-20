-- Create custom types
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT
            1
        FROM
            pg_type
        WHERE
            typname = 'billing_plan'
    ) THEN CREATE TYPE public.billing_plan AS ENUM ('pro');

END IF;

IF NOT EXISTS (
    SELECT
        1
    FROM
        pg_type
    WHERE
        typname = 'project_permission'
) THEN CREATE TYPE public.project_permission AS ENUM ('read', 'write');

END IF;

IF NOT EXISTS (
    SELECT
        1
    FROM
        pg_type
    WHERE
        typname = 'workflow_run_status'
) THEN CREATE TYPE public.workflow_run_status AS ENUM (
    'pending',
    'scheduled',
    'cancelled',
    'completed',
    'failed',
    'running'
);

END IF;

END $$;

-- Create function
CREATE
OR REPLACE FUNCTION public.create_numeric_id_for_workflow_run () RETURNS TRIGGER AS $$
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
            wr.workflow_id = NEW .workflow_id
    )
    SELECT
        row_number INTO run_count
    FROM
        tmp
    WHERE
        tmp.id = NEW .id;

UPDATE
    workflow_runs
SET
    numeric_id = run_count
WHERE
    id = NEW .id;

RETURN NEW;

END;

$$ LANGUAGE plpgsql;

-- Create tables
CREATE TABLE IF NOT EXISTS
    public.projects (
        id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        creator uuid REFERENCES auth.users (id) ON DELETE SET NULL,
        is_personal boolean DEFAULT false NOT NULL,
        name text DEFAULT 'Untitled Project' NOT NULL,
        billing_plan public.billing_plan,
        billing_start_date date DEFAULT CURRENT_DATE
    );

CREATE TABLE IF NOT EXISTS
    public.project_invitations (
        id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
        invitee_email text NOT NULL
    );

CREATE TABLE IF NOT EXISTS
    public.projects_users (
        project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
        permissions public.project_permission[] DEFAULT ARRAY['read', 'write']::public.project_permission[] NOT NULL,
        PRIMARY KEY (project_id, user_id)
    );

CREATE TABLE IF NOT EXISTS
    public.service_accounts (
        id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        service_def_id text,
        service_user_id text,
        display_name text,
        refresh_token text,
        profile jsonb,
        scopes text[],
        creator uuid REFERENCES auth.users (id) ON DELETE SET NULL,
        encrypted_token text NOT NULL,
        UNIQUE (service_def_id, service_user_id)
    );

CREATE TABLE IF NOT EXISTS
    public.projects_service_accounts (
        project_id uuid NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
        service_account_id uuid NOT NULL REFERENCES public.service_accounts (id) ON DELETE CASCADE,
        PRIMARY KEY (project_id, service_account_id)
    );

CREATE TABLE IF NOT EXISTS
    public.workflows (
        id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        creator uuid REFERENCES auth.users (id) ON DELETE SET NULL,
        is_enabled boolean DEFAULT false NOT NULL,
        name text DEFAULT 'Untitled Workflow',
        project_id uuid REFERENCES public.projects (id) ON DELETE CASCADE,
        last_edited_at timestamp with time zone,
        last_ran_at timestamp with time zone,
        current_graph_id uuid
    );

CREATE TABLE IF NOT EXISTS
    public.workflow_graphs (
        id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        workflow_id uuid REFERENCES public.workflows (id) ON DELETE CASCADE,
        nodes jsonb DEFAULT '[]' NOT NULL,
        edges jsonb DEFAULT '[]' NOT NULL
    );

ALTER TABLE public.workflows
ADD CONSTRAINT public_workflows_graph_fkey FOREIGN KEY (current_graph_id) REFERENCES public.workflow_graphs (id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS
    public.triggers (
        id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        workflow_id uuid NOT NULL REFERENCES public.workflows (id) ON DELETE CASCADE,
        config jsonb DEFAULT '{}' NOT NULL,
        state jsonb DEFAULT '{}' NOT NULL,
        service_account_id uuid REFERENCES public.service_accounts (id) ON DELETE SET NULL,
        def_id text NOT NULL
    );

COMMENT ON COLUMN public.triggers.service_account_id IS 'ID of the connected service account, if required for this trigger';

CREATE TABLE IF NOT EXISTS
    public.workflow_runs (
        id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
        workflow_id uuid NOT NULL REFERENCES public.workflows (id) ON DELETE CASCADE,
        trigger_id uuid REFERENCES public.triggers (id),
        workflow_graph_id uuid NOT NULL REFERENCES public.workflow_graphs (id),
        status public.workflow_run_status DEFAULT 'pending' NOT NULL,
        numeric_id integer,
        node_outputs jsonb DEFAULT '{}' NOT NULL,
        node_errors jsonb DEFAULT '{}' NOT NULL,
        global_outputs jsonb DEFAULT '{}' NOT NULL,
        global_errors jsonb DEFAULT '[]' NOT NULL,
        trigger_payload jsonb DEFAULT '{}' NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        started_at timestamp with time zone,
        finished_at timestamp with time zone,
        scheduled_for timestamp with time zone
    );

CREATE TABLE IF NOT EXISTS
    public.workflow_run_node_outputs (
        id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        workflow_run_id uuid NOT NULL REFERENCES public.workflow_runs (id) ON DELETE CASCADE,
        node_id text NOT NULL,
        handle_id text NOT NULL,
        type_meta_id text,
        value jsonb
    );

CREATE TABLE IF NOT EXISTS
    public.workflows_usage_records (
        id uuid DEFAULT gen_random_uuid () PRIMARY KEY,
        workflow_id uuid NOT NULL REFERENCES public.workflows (id),
        billing_period_id text NOT NULL,
        run_count integer DEFAULT 0 NOT NULL,
        UNIQUE (billing_period_id, workflow_id)
    );

COMMENT ON TABLE public.workflows_usage_records IS 'Because workflow runs are cascade deleted, these records are persistent and store accurate usage information for workflows.';

CREATE TABLE IF NOT EXISTS
    public.user_meta (
        id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        personal_project_id uuid REFERENCES public.projects (id) ON DELETE SET NULL,
    );

-- Create trigger
DROP TRIGGER IF EXISTS trigger_create_numeric_id_for_workflow_run ON public.workflow_runs;

CREATE TRIGGER trigger_create_numeric_id_for_workflow_run
AFTER INSERT ON public.workflow_runs FOR EACH ROW
EXECUTE FUNCTION public.create_numeric_id_for_workflow_run ();

-- Enable row level security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.project_invitations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.projects_users ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.service_accounts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.projects_service_accounts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.workflow_graphs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.triggers ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.workflow_run_node_outputs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.workflows_usage_records ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_meta ENABLE ROW LEVEL SECURITY;