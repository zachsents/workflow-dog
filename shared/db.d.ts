import type { ColumnType } from "kysely";

export type ArrayType<T> = ArrayTypeImpl<T> extends (infer U)[]
  ? U[]
  : ArrayTypeImpl<T>;

export type ArrayTypeImpl<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S[], I[], U[]>
  : T[];

export type BillingPlan = "pro";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = JsonValue;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type ProjectPermission = "read" | "write";

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type WorkflowRunStatus = "cancelled" | "completed" | "failed" | "pending" | "running" | "scheduled";

export interface AuthUsers {
  aud: string | null;
  banned_until: Timestamp | null;
  confirmation_sent_at: Timestamp | null;
  confirmation_token: string | null;
  confirmed_at: Generated<Timestamp | null>;
  created_at: Timestamp | null;
  deleted_at: Timestamp | null;
  email: string | null;
  email_change: string | null;
  email_change_confirm_status: Generated<number | null>;
  email_change_sent_at: Timestamp | null;
  email_change_token_current: Generated<string | null>;
  email_change_token_new: string | null;
  email_confirmed_at: Timestamp | null;
  encrypted_password: string | null;
  id: string;
  instance_id: string | null;
  invited_at: Timestamp | null;
  is_anonymous: Generated<boolean>;
  /**
   * Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.
   */
  is_sso_user: Generated<boolean>;
  is_super_admin: boolean | null;
  last_sign_in_at: Timestamp | null;
  phone: Generated<string | null>;
  phone_change: Generated<string | null>;
  phone_change_sent_at: Timestamp | null;
  phone_change_token: Generated<string | null>;
  phone_confirmed_at: Timestamp | null;
  raw_app_meta_data: Json | null;
  raw_user_meta_data: Json | null;
  reauthentication_sent_at: Timestamp | null;
  reauthentication_token: Generated<string | null>;
  recovery_sent_at: Timestamp | null;
  recovery_token: string | null;
  role: string | null;
  updated_at: Timestamp | null;
}

export interface ProjectInvitations {
  created_at: Generated<Timestamp>;
  id: Generated<string>;
  invitee_email: string;
  project_id: string;
}

export interface Projects {
  billing_plan: BillingPlan | null;
  billing_start_date: Generated<Timestamp | null>;
  created_at: Generated<Timestamp>;
  creator: string | null;
  id: Generated<string>;
  is_personal: Generated<boolean>;
  name: Generated<string>;
}

export interface ProjectsServiceAccounts {
  project_id: string;
  service_account_id: string;
}

export interface ProjectsUsers {
  permissions: Generated<ArrayType<ProjectPermission>>;
  project_id: string;
  user_id: string;
}

export interface ServiceAccounts {
  created_at: Generated<Timestamp>;
  creator: string | null;
  display_name: string | null;
  encrypted_token: string;
  id: Generated<string>;
  profile: Json | null;
  refresh_token: string | null;
  scopes: string[] | null;
  service_def_id: string | null;
  service_user_id: string | null;
}

export interface Triggers {
  config: Generated<Json>;
  created_at: Generated<Timestamp>;
  def_id: string;
  id: Generated<string>;
  /**
   * ID of the connected service account, if required for this trigger
   */
  service_account_id: string | null;
  state: Generated<Json>;
  workflow_id: string;
}

export interface UserMeta {
  created_at: Generated<Timestamp>;
  id: string;
  personal_project_created: Generated<boolean>;
  personal_project_id: string | null;
}

export interface WorkflowGraphs {
  created_at: Generated<Timestamp>;
  edges: Generated<Json>;
  id: Generated<string>;
  nodes: Generated<Json>;
  workflow_id: string | null;
}

export interface WorkflowRunNodeOutputs {
  created_at: Generated<Timestamp>;
  handle_id: string;
  id: Generated<string>;
  node_id: string;
  type_meta_id: string | null;
  value: Json | null;
  workflow_run_id: string;
}

export interface WorkflowRuns {
  created_at: Generated<Timestamp>;
  finished_at: Timestamp | null;
  global_errors: Generated<Json>;
  global_outputs: Generated<Json>;
  id: Generated<string>;
  node_errors: Generated<Json>;
  node_outputs: Generated<Json>;
  numeric_id: number | null;
  scheduled_for: Timestamp | null;
  started_at: Timestamp | null;
  status: Generated<WorkflowRunStatus>;
  trigger_id: string | null;
  trigger_payload: Generated<Json>;
  workflow_graph_id: string;
  workflow_id: string;
}

export interface Workflows {
  created_at: Generated<Timestamp>;
  creator: string | null;
  current_graph_id: string | null;
  id: Generated<string>;
  is_enabled: Generated<boolean>;
  last_edited_at: Timestamp | null;
  last_ran_at: Timestamp | null;
  name: Generated<string | null>;
  project_id: string | null;
}

export interface WorkflowsUsageRecords {
  billing_period_id: string;
  id: Generated<string>;
  run_count: Generated<number>;
  workflow_id: string;
}

export interface DB {
  "auth.users": AuthUsers;
  project_invitations: ProjectInvitations;
  projects: Projects;
  projects_service_accounts: ProjectsServiceAccounts;
  projects_users: ProjectsUsers;
  service_accounts: ServiceAccounts;
  triggers: Triggers;
  user_meta: UserMeta;
  workflow_graphs: WorkflowGraphs;
  workflow_run_node_outputs: WorkflowRunNodeOutputs;
  workflow_runs: WorkflowRuns;
  workflows: Workflows;
  workflows_usage_records: WorkflowsUsageRecords;
}
