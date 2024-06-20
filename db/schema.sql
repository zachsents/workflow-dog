--
-- PostgreSQL database dump
--
-- Dumped from database version 15.1 (Ubuntu 15.1-1.pgdg20.04+1)
-- Dumped by pg_dump version 15.6 (Ubuntu 15.6-1.pgdg20.04+1)
SET
    statement_timeout = 0;

SET
    lock_timeout = 0;

SET
    idle_in_transaction_session_timeout = 0;

SET
    client_encoding = 'UTF8';

SET
    standard_conforming_strings = on;

SELECT
    pg_catalog.set_config('search_path', '', false);

SET
    check_function_bodies = false;

SET
    xmloption = content;

SET
    client_min_messages = warning;

SET
    row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--
CREATE SCHEMA public;

ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--
COMMENT ON SCHEMA public IS 'standard public schema';

--
-- Name: billing_plan; Type: TYPE; Schema: public; Owner: supabase_admin
--
CREATE TYPE public.billing_plan AS ENUM ('pro');

ALTER TYPE public.billing_plan OWNER TO supabase_admin;

--
-- Name: project_permission; Type: TYPE; Schema: public; Owner: supabase_admin
--
CREATE TYPE public.project_permission AS ENUM ('read', 'write');

ALTER TYPE public.project_permission OWNER TO supabase_admin;

--
-- Name: workflow_run_status; Type: TYPE; Schema: public; Owner: supabase_admin
--
CREATE TYPE public.workflow_run_status AS ENUM (
    'pending',
    'scheduled',
    'cancelled',
    'completed',
    'failed',
    'running'
);

ALTER TYPE public.workflow_run_status OWNER TO supabase_admin;

--
-- Name: create_numeric_id_for_workflow_run(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--
CREATE FUNCTION public.create_numeric_id_for_workflow_run() RETURNS trigger LANGUAGE plpgsql AS $ $ declare run_count int;

BEGIN with tmp as (
    select
        wr.id,
        row_number() over (
            order by
                wr.created_at
        )
    from
        workflow_runs wr
    where
        wr.workflow_id = NEW.workflow_id
)
select
    row_number into run_count
from
    tmp
where
    tmp.id = NEW.id;

update
    workflow_runs
set
    numeric_id = run_count
where
    id = new.id;

RETURN NEW;

END;

$ $;

ALTER FUNCTION public.create_numeric_id_for_workflow_run() OWNER TO supabase_admin;

SET
    default_tablespace = '';

SET
    default_table_access_method = heap;

--
-- Name: project_invitations; Type: TABLE; Schema: public; Owner: supabase_admin
--
CREATE TABLE public.project_invitations (
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    project_id uuid NOT NULL,
    invitee_email text NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);

ALTER TABLE
    public.project_invitations OWNER TO supabase_admin;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: supabase_admin
--
CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    creator uuid,
    is_personal boolean DEFAULT false NOT NULL,
    name text DEFAULT 'Untitled Project' :: text NOT NULL,
    billing_plan public.billing_plan,
    billing_start_date date DEFAULT CURRENT_DATE
);

ALTER TABLE
    public.projects OWNER TO supabase_admin;

--
-- Name: projects_service_accounts; Type: TABLE; Schema: public; Owner: supabase_admin
--
CREATE TABLE public.projects_service_accounts (
    project_id uuid NOT NULL,
    service_account_id uuid NOT NULL
);

ALTER TABLE
    public.projects_service_accounts OWNER TO supabase_admin;

--
-- Name: projects_users; Type: TABLE; Schema: public; Owner: supabase_admin
--
CREATE TABLE public.projects_users (
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    permissions public.project_permission [] DEFAULT '{read,write}' :: public.project_permission [] NOT NULL
);

ALTER TABLE
    public.projects_users OWNER TO supabase_admin;

--
-- Name: service_accounts; Type: TABLE; Schema: public; Owner: supabase_admin
--
CREATE TABLE public.service_accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    service_def_id text,
    service_user_id text,
    display_name text,
    refresh_token text,
    profile jsonb,
    scopes text [],
    creator uuid,
    encrypted_token text NOT NULL
);

ALTER TABLE
    public.service_accounts OWNER TO supabase_admin;

--
-- Name: triggers; Type: TABLE; Schema: public; Owner: supabase_admin
--
CREATE TABLE public.triggers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    workflow_id uuid NOT NULL,
    config jsonb DEFAULT '{}' :: jsonb NOT NULL,
    state jsonb DEFAULT '{}' :: jsonb NOT NULL,
    service_account_id uuid,
    def_id text NOT NULL
);

ALTER TABLE
    public.triggers OWNER TO supabase_admin;

--
-- Name: COLUMN triggers.service_account_id; Type: COMMENT; Schema: public; Owner: supabase_admin
--
COMMENT ON COLUMN public.triggers.service_account_id IS 'ID of the connected service account, if required for this trigger';

--
-- Name: user_meta; Type: TABLE; Schema: public; Owner: supabase_admin
--
CREATE TABLE public.user_meta (
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    personal_project_id uuid,
    personal_project_created boolean DEFAULT false NOT NULL
);

ALTER TABLE
    public.user_meta OWNER TO supabase_admin;

--
-- Name: workflow_graphs; Type: TABLE; Schema: public; Owner: supabase_admin
--
CREATE TABLE public.workflow_graphs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    workflow_id uuid,
    nodes jsonb DEFAULT '[]' :: jsonb NOT NULL,
    edges jsonb DEFAULT '[]' :: jsonb NOT NULL
);

ALTER TABLE
    public.workflow_graphs OWNER TO supabase_admin;

--
-- Name: workflow_run_node_outputs; Type: TABLE; Schema: public; Owner: supabase_admin
--
CREATE TABLE public.workflow_run_node_outputs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    workflow_run_id uuid NOT NULL,
    node_id text NOT NULL,
    handle_id text NOT NULL,
    type_meta_id text,
    value jsonb
);

ALTER TABLE
    public.workflow_run_node_outputs OWNER TO supabase_admin;

--
-- Name: workflow_runs; Type: TABLE; Schema: public; Owner: supabase_admin
--
CREATE TABLE public.workflow_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_id uuid NOT NULL,
    trigger_id uuid,
    workflow_graph_id uuid NOT NULL,
    status public.workflow_run_status DEFAULT 'pending' :: public.workflow_run_status NOT NULL,
    numeric_id integer,
    node_outputs jsonb DEFAULT '{}' :: jsonb NOT NULL,
    node_errors jsonb DEFAULT '{}' :: jsonb NOT NULL,
    global_outputs jsonb DEFAULT '{}' :: jsonb NOT NULL,
    global_errors jsonb DEFAULT '[]' :: jsonb NOT NULL,
    trigger_payload jsonb DEFAULT '{}' :: jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    started_at timestamp with time zone,
    finished_at timestamp with time zone,
    scheduled_for timestamp with time zone
);

ALTER TABLE
    public.workflow_runs OWNER TO supabase_admin;

--
-- Name: workflows; Type: TABLE; Schema: public; Owner: supabase_admin
--
CREATE TABLE public.workflows (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    creator uuid,
    is_enabled boolean DEFAULT false NOT NULL,
    name text DEFAULT 'Untitled Workflow' :: text,
    project_id uuid,
    last_edited_at timestamp with time zone,
    last_ran_at timestamp with time zone,
    current_graph_id uuid
);

ALTER TABLE
    public.workflows OWNER TO supabase_admin;

--
-- Name: workflows_usage_records; Type: TABLE; Schema: public; Owner: supabase_admin
--
CREATE TABLE public.workflows_usage_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workflow_id uuid NOT NULL,
    billing_period_id text NOT NULL,
    run_count integer DEFAULT 0 NOT NULL
);

ALTER TABLE
    public.workflows_usage_records OWNER TO supabase_admin;

--
-- Name: TABLE workflows_usage_records; Type: COMMENT; Schema: public; Owner: supabase_admin
--
COMMENT ON TABLE public.workflows_usage_records IS 'Because workflow runs are cascade deleted, these records are persistent and store accurate usage information for workflows.';

--
-- Name: project_invitations project_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.project_invitations
ADD
    CONSTRAINT project_invitations_pkey PRIMARY KEY (id);

--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.projects
ADD
    CONSTRAINT projects_pkey PRIMARY KEY (id);

--
-- Name: projects_service_accounts projects_service_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.projects_service_accounts
ADD
    CONSTRAINT projects_service_accounts_pkey PRIMARY KEY (project_id, service_account_id);

--
-- Name: projects_users projects_users_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.projects_users
ADD
    CONSTRAINT projects_users_pkey PRIMARY KEY (project_id, user_id);

--
-- Name: service_accounts service_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.service_accounts
ADD
    CONSTRAINT service_accounts_pkey PRIMARY KEY (id);

--
-- Name: service_accounts service_accounts_service_key; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.service_accounts
ADD
    CONSTRAINT service_accounts_service_key UNIQUE (service_def_id, service_user_id);

--
-- Name: triggers triggers_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.triggers
ADD
    CONSTRAINT triggers_pkey PRIMARY KEY (id);

--
-- Name: workflows_usage_records uc_billing_workflow; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.workflows_usage_records
ADD
    CONSTRAINT uc_billing_workflow UNIQUE (billing_period_id, workflow_id);

--
-- Name: user_meta user_meta_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.user_meta
ADD
    CONSTRAINT user_meta_pkey PRIMARY KEY (id);

--
-- Name: workflow_graphs workflow_graphs_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.workflow_graphs
ADD
    CONSTRAINT workflow_graphs_pkey PRIMARY KEY (id);

--
-- Name: workflow_run_node_outputs workflow_run_node_outputs_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.workflow_run_node_outputs
ADD
    CONSTRAINT workflow_run_node_outputs_pkey PRIMARY KEY (id);

--
-- Name: workflow_runs workflow_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.workflow_runs
ADD
    CONSTRAINT workflow_runs_pkey PRIMARY KEY (id);

--
-- Name: workflows workflows_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.workflows
ADD
    CONSTRAINT workflows_pkey PRIMARY KEY (id);

--
-- Name: workflows_usage_records workflows_usage_records_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.workflows_usage_records
ADD
    CONSTRAINT workflows_usage_records_pkey PRIMARY KEY (id);

--
-- Name: workflow_runs trigger_create_numeric_id_for_workflow_run; Type: TRIGGER; Schema: public; Owner: supabase_admin
--
CREATE TRIGGER trigger_create_numeric_id_for_workflow_run
AFTER
INSERT
    ON public.workflow_runs FOR EACH ROW EXECUTE FUNCTION public.create_numeric_id_for_workflow_run();

--
-- Name: projects projects_creator_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.projects
ADD
    CONSTRAINT projects_creator_fkey FOREIGN KEY (creator) REFERENCES auth.users(id) ON DELETE CASCADE;

--
-- Name: projects_service_accounts projects_service_accounts_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.projects_service_accounts
ADD
    CONSTRAINT projects_service_accounts_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

--
-- Name: projects_service_accounts projects_service_accounts_service_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.projects_service_accounts
ADD
    CONSTRAINT projects_service_accounts_service_account_id_fkey FOREIGN KEY (service_account_id) REFERENCES public.service_accounts(id) ON DELETE CASCADE;

--
-- Name: projects_users projects_users_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.projects_users
ADD
    CONSTRAINT projects_users_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

--
-- Name: projects_users projects_users_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.projects_users
ADD
    CONSTRAINT projects_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

--
-- Name: project_invitations public_project_invitations_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.project_invitations
ADD
    CONSTRAINT public_project_invitations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

--
-- Name: triggers public_triggers_service_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.triggers
ADD
    CONSTRAINT public_triggers_service_account_id_fkey FOREIGN KEY (service_account_id) REFERENCES public.service_accounts(id) ON DELETE
SET
    NULL;

--
-- Name: triggers public_triggers_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.triggers
ADD
    CONSTRAINT public_triggers_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;

--
-- Name: user_meta public_user_meta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.user_meta
ADD
    CONSTRAINT public_user_meta_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

--
-- Name: user_meta public_user_meta_personal_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.user_meta
ADD
    CONSTRAINT public_user_meta_personal_project_id_fkey FOREIGN KEY (personal_project_id) REFERENCES public.projects(id) ON DELETE
SET
    NULL;

--
-- Name: workflow_graphs public_workflow_graphs_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.workflow_graphs
ADD
    CONSTRAINT public_workflow_graphs_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflows(id) ON DELETE CASCADE;

--
-- Name: workflow_run_node_outputs public_workflow_run_node_outputs_workflow_run_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.workflow_run_node_outputs
ADD
    CONSTRAINT public_workflow_run_node_outputs_workflow_run_id_fkey FOREIGN KEY (workflow_run_id) REFERENCES public.workflow_runs(id) ON DELETE CASCADE;

--
-- Name: workflows public_workflows_graph_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.workflows
ADD
    CONSTRAINT public_workflows_graph_fkey FOREIGN KEY (current_graph_id) REFERENCES public.workflow_graphs(id) ON DELETE
SET
    NULL;

--
-- Name: workflows_usage_records public_workflows_usage_records_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.workflows_usage_records
ADD
    CONSTRAINT public_workflows_usage_records_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflows(id);

--
-- Name: service_accounts service_accounts_creator_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.service_accounts
ADD
    CONSTRAINT service_accounts_creator_fkey FOREIGN KEY (creator) REFERENCES auth.users(id) ON DELETE
SET
    NULL;

--
-- Name: workflow_runs workflow_runs_trigger_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.workflow_runs
ADD
    CONSTRAINT workflow_runs_trigger_id_fkey FOREIGN KEY (trigger_id) REFERENCES public.triggers(id);

--
-- Name: workflow_runs workflow_runs_workflow_graph_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.workflow_runs
ADD
    CONSTRAINT workflow_runs_workflow_graph_id_fkey FOREIGN KEY (workflow_graph_id) REFERENCES public.workflow_graphs(id);

--
-- Name: workflow_runs workflow_runs_workflow_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.workflow_runs
ADD
    CONSTRAINT workflow_runs_workflow_id_fkey FOREIGN KEY (workflow_id) REFERENCES public.workflows(id);

--
-- Name: workflows workflows_creator_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.workflows
ADD
    CONSTRAINT workflows_creator_fkey FOREIGN KEY (creator) REFERENCES auth.users(id) ON DELETE CASCADE;

--
-- Name: workflows workflows_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    ONLY public.workflows
ADD
    CONSTRAINT workflows_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

--
-- Name: project_invitations; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    public.project_invitations ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    public.projects ENABLE ROW LEVEL SECURITY;

--
-- Name: projects_service_accounts; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    public.projects_service_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: projects_users; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    public.projects_users ENABLE ROW LEVEL SECURITY;

--
-- Name: service_accounts; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    public.service_accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: triggers; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    public.triggers ENABLE ROW LEVEL SECURITY;

--
-- Name: user_meta; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    public.user_meta ENABLE ROW LEVEL SECURITY;

--
-- Name: workflow_graphs; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    public.workflow_graphs ENABLE ROW LEVEL SECURITY;

--
-- Name: workflow_run_node_outputs; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    public.workflow_run_node_outputs ENABLE ROW LEVEL SECURITY;

--
-- Name: workflow_runs; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    public.workflow_runs ENABLE ROW LEVEL SECURITY;

--
-- Name: workflows; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    public.workflows ENABLE ROW LEVEL SECURITY;

--
-- Name: workflows_usage_records; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--
ALTER TABLE
    public.workflows_usage_records ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--
GRANT USAGE ON SCHEMA public TO postgres;

GRANT USAGE ON SCHEMA public TO anon;

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT USAGE ON SCHEMA public TO service_role;

--
-- Name: FUNCTION create_numeric_id_for_workflow_run(); Type: ACL; Schema: public; Owner: supabase_admin
--
GRANT ALL ON FUNCTION public.create_numeric_id_for_workflow_run() TO postgres;

GRANT ALL ON FUNCTION public.create_numeric_id_for_workflow_run() TO anon;

GRANT ALL ON FUNCTION public.create_numeric_id_for_workflow_run() TO authenticated;

GRANT ALL ON FUNCTION public.create_numeric_id_for_workflow_run() TO service_role;

--
-- Name: TABLE project_invitations; Type: ACL; Schema: public; Owner: supabase_admin
--
GRANT ALL ON TABLE public.project_invitations TO postgres;

GRANT ALL ON TABLE public.project_invitations TO anon;

GRANT ALL ON TABLE public.project_invitations TO authenticated;

GRANT ALL ON TABLE public.project_invitations TO service_role;

--
-- Name: TABLE projects; Type: ACL; Schema: public; Owner: supabase_admin
--
GRANT ALL ON TABLE public.projects TO postgres;

GRANT ALL ON TABLE public.projects TO anon;

GRANT ALL ON TABLE public.projects TO authenticated;

GRANT ALL ON TABLE public.projects TO service_role;

--
-- Name: TABLE projects_service_accounts; Type: ACL; Schema: public; Owner: supabase_admin
--
GRANT ALL ON TABLE public.projects_service_accounts TO postgres;

GRANT ALL ON TABLE public.projects_service_accounts TO anon;

GRANT ALL ON TABLE public.projects_service_accounts TO authenticated;

GRANT ALL ON TABLE public.projects_service_accounts TO service_role;

--
-- Name: TABLE projects_users; Type: ACL; Schema: public; Owner: supabase_admin
--
GRANT ALL ON TABLE public.projects_users TO postgres;

GRANT ALL ON TABLE public.projects_users TO anon;

GRANT ALL ON TABLE public.projects_users TO authenticated;

GRANT ALL ON TABLE public.projects_users TO service_role;

--
-- Name: TABLE service_accounts; Type: ACL; Schema: public; Owner: supabase_admin
--
GRANT ALL ON TABLE public.service_accounts TO postgres;

GRANT ALL ON TABLE public.service_accounts TO anon;

GRANT ALL ON TABLE public.service_accounts TO authenticated;

GRANT ALL ON TABLE public.service_accounts TO service_role;

--
-- Name: TABLE triggers; Type: ACL; Schema: public; Owner: supabase_admin
--
GRANT ALL ON TABLE public.triggers TO postgres;

GRANT ALL ON TABLE public.triggers TO anon;

GRANT ALL ON TABLE public.triggers TO authenticated;

GRANT ALL ON TABLE public.triggers TO service_role;

--
-- Name: TABLE user_meta; Type: ACL; Schema: public; Owner: supabase_admin
--
GRANT ALL ON TABLE public.user_meta TO postgres;

GRANT ALL ON TABLE public.user_meta TO anon;

GRANT ALL ON TABLE public.user_meta TO authenticated;

GRANT ALL ON TABLE public.user_meta TO service_role;

--
-- Name: TABLE workflow_graphs; Type: ACL; Schema: public; Owner: supabase_admin
--
GRANT ALL ON TABLE public.workflow_graphs TO postgres;

GRANT ALL ON TABLE public.workflow_graphs TO anon;

GRANT ALL ON TABLE public.workflow_graphs TO authenticated;

GRANT ALL ON TABLE public.workflow_graphs TO service_role;

--
-- Name: TABLE workflow_run_node_outputs; Type: ACL; Schema: public; Owner: supabase_admin
--
GRANT ALL ON TABLE public.workflow_run_node_outputs TO postgres;

GRANT ALL ON TABLE public.workflow_run_node_outputs TO anon;

GRANT ALL ON TABLE public.workflow_run_node_outputs TO authenticated;

GRANT ALL ON TABLE public.workflow_run_node_outputs TO service_role;

--
-- Name: TABLE workflow_runs; Type: ACL; Schema: public; Owner: supabase_admin
--
GRANT ALL ON TABLE public.workflow_runs TO postgres;

GRANT ALL ON TABLE public.workflow_runs TO anon;

GRANT ALL ON TABLE public.workflow_runs TO authenticated;

GRANT ALL ON TABLE public.workflow_runs TO service_role;

--
-- Name: TABLE workflows; Type: ACL; Schema: public; Owner: supabase_admin
--
GRANT ALL ON TABLE public.workflows TO postgres;

GRANT ALL ON TABLE public.workflows TO anon;

GRANT ALL ON TABLE public.workflows TO authenticated;

GRANT ALL ON TABLE public.workflows TO service_role;

--
-- Name: TABLE workflows_usage_records; Type: ACL; Schema: public; Owner: supabase_admin
--
GRANT ALL ON TABLE public.workflows_usage_records TO postgres;

GRANT ALL ON TABLE public.workflows_usage_records TO anon;

GRANT ALL ON TABLE public.workflows_usage_records TO authenticated;

GRANT ALL ON TABLE public.workflows_usage_records TO service_role;

--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;

--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;

--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;

--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;

--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;

--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;

--
-- PostgreSQL database dump complete
--