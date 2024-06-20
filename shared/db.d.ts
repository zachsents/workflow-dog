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

export type Int8 = ColumnType<string, bigint | number | string, bigint | number | string>;

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

export interface AuthAccounts {
  access_token: string | null;
  expires_at: Int8 | null;
  id: Generated<string>;
  id_token: string | null;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  scope: string | null;
  session_state: string | null;
  token_type: string | null;
  type: string;
  userId: string;
}

export interface AuthSessions {
  expires: Timestamp;
  id: Generated<string>;
  sessionToken: string;
  userId: string;
}

export interface AuthUsers {
  email: string;
  emailVerified: Timestamp | null;
  id: Generated<string>;
  image: string | null;
  name: string | null;
}

export interface AuthVerificationToken {
  expires: Timestamp;
  identifier: string;
  token: string;
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
  "auth.accounts": AuthAccounts;
  "auth.sessions": AuthSessions;
  "auth.users": AuthUsers;
  "auth.verification_token": AuthVerificationToken;
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
