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

export interface AuthAllAuthRecipeUsers {
  app_id: Generated<string>;
  is_linked_or_is_a_primary_user: Generated<boolean>;
  primary_or_recipe_user_id: string;
  primary_or_recipe_user_time_joined: Int8;
  recipe_id: string;
  tenant_id: Generated<string>;
  time_joined: Int8;
  user_id: string;
}

export interface AuthAppIdToUserId {
  app_id: Generated<string>;
  is_linked_or_is_a_primary_user: Generated<boolean>;
  primary_or_recipe_user_id: string;
  recipe_id: string;
  user_id: string;
}

export interface AuthApps {
  app_id: Generated<string>;
  created_at_time: Int8 | null;
}

export interface AuthDashboardUsers {
  app_id: Generated<string>;
  email: string;
  password_hash: string;
  time_joined: Int8;
  user_id: string;
}

export interface AuthDashboardUserSessions {
  app_id: Generated<string>;
  expiry: Int8;
  session_id: string;
  time_created: Int8;
  user_id: string;
}

export interface AuthEmailpasswordPswdResetTokens {
  app_id: Generated<string>;
  email: string | null;
  token: string;
  token_expiry: Int8;
  user_id: string;
}

export interface AuthEmailpasswordUsers {
  app_id: Generated<string>;
  email: string;
  password_hash: string;
  time_joined: Int8;
  user_id: string;
}

export interface AuthEmailpasswordUserToTenant {
  app_id: Generated<string>;
  email: string;
  tenant_id: Generated<string>;
  user_id: string;
}

export interface AuthEmailverificationTokens {
  app_id: Generated<string>;
  email: string;
  tenant_id: Generated<string>;
  token: string;
  token_expiry: Int8;
  user_id: string;
}

export interface AuthEmailverificationVerifiedEmails {
  app_id: Generated<string>;
  email: string;
  user_id: string;
}

export interface AuthJwtSigningKeys {
  algorithm: string;
  app_id: Generated<string>;
  created_at: Int8 | null;
  key_id: string;
  key_string: string;
}

export interface AuthKeyValue {
  app_id: Generated<string>;
  created_at_time: Int8 | null;
  name: string;
  tenant_id: Generated<string>;
  value: string | null;
}

export interface AuthPasswordlessCodes {
  app_id: Generated<string>;
  code_id: string;
  created_at: Int8;
  device_id_hash: string;
  link_code_hash: string;
  tenant_id: Generated<string>;
}

export interface AuthPasswordlessDevices {
  app_id: Generated<string>;
  device_id_hash: string;
  email: string | null;
  failed_attempts: number;
  link_code_salt: string;
  phone_number: string | null;
  tenant_id: Generated<string>;
}

export interface AuthPasswordlessUsers {
  app_id: Generated<string>;
  email: string | null;
  phone_number: string | null;
  time_joined: Int8;
  user_id: string;
}

export interface AuthPasswordlessUserToTenant {
  app_id: Generated<string>;
  email: string | null;
  phone_number: string | null;
  tenant_id: Generated<string>;
  user_id: string;
}

export interface AuthRolePermissions {
  app_id: Generated<string>;
  permission: string;
  role: string;
}

export interface AuthRoles {
  app_id: Generated<string>;
  role: string;
}

export interface AuthSessionAccessTokenSigningKeys {
  app_id: Generated<string>;
  created_at_time: Int8;
  value: string | null;
}

export interface AuthSessionInfo {
  app_id: Generated<string>;
  created_at_time: Int8;
  expires_at: Int8;
  jwt_user_payload: string | null;
  refresh_token_hash_2: string;
  session_data: string | null;
  session_handle: string;
  tenant_id: Generated<string>;
  use_static_key: boolean;
  user_id: string;
}

export interface AuthTenantConfigs {
  app_id: Generated<string>;
  connection_uri_domain: Generated<string>;
  core_config: string | null;
  email_password_enabled: boolean | null;
  passwordless_enabled: boolean | null;
  tenant_id: Generated<string>;
  third_party_enabled: boolean | null;
}

export interface AuthTenantFirstFactors {
  app_id: Generated<string>;
  connection_uri_domain: Generated<string>;
  factor_id: string;
  tenant_id: Generated<string>;
}

export interface AuthTenantRequiredSecondaryFactors {
  app_id: Generated<string>;
  connection_uri_domain: Generated<string>;
  factor_id: string;
  tenant_id: Generated<string>;
}

export interface AuthTenants {
  app_id: Generated<string>;
  created_at_time: Int8 | null;
  tenant_id: Generated<string>;
}

export interface AuthTenantThirdpartyProviderClients {
  additional_config: string | null;
  app_id: Generated<string>;
  client_id: string;
  client_secret: string | null;
  client_type: Generated<string>;
  connection_uri_domain: Generated<string>;
  force_pkce: boolean | null;
  scope: string[] | null;
  tenant_id: Generated<string>;
  third_party_id: string;
}

export interface AuthTenantThirdpartyProviders {
  app_id: Generated<string>;
  authorization_endpoint: string | null;
  authorization_endpoint_query_params: string | null;
  connection_uri_domain: Generated<string>;
  jwks_uri: string | null;
  name: string | null;
  oidc_discovery_endpoint: string | null;
  require_email: boolean | null;
  tenant_id: Generated<string>;
  third_party_id: string;
  token_endpoint: string | null;
  token_endpoint_body_params: string | null;
  user_info_endpoint: string | null;
  user_info_endpoint_headers: string | null;
  user_info_endpoint_query_params: string | null;
  user_info_map_from_id_token_payload_email: string | null;
  user_info_map_from_id_token_payload_email_verified: string | null;
  user_info_map_from_id_token_payload_user_id: string | null;
  user_info_map_from_user_info_endpoint_email: string | null;
  user_info_map_from_user_info_endpoint_email_verified: string | null;
  user_info_map_from_user_info_endpoint_user_id: string | null;
}

export interface AuthThirdpartyUsers {
  app_id: Generated<string>;
  email: string;
  third_party_id: string;
  third_party_user_id: string;
  time_joined: Int8;
  user_id: string;
}

export interface AuthThirdpartyUserToTenant {
  app_id: Generated<string>;
  tenant_id: Generated<string>;
  third_party_id: string;
  third_party_user_id: string;
  user_id: string;
}

export interface AuthTotpUsedCodes {
  app_id: Generated<string>;
  code: string;
  created_time_ms: Int8;
  expiry_time_ms: Int8;
  is_valid: boolean;
  tenant_id: Generated<string>;
  user_id: string;
}

export interface AuthTotpUserDevices {
  app_id: Generated<string>;
  created_at: Int8 | null;
  device_name: string;
  period: number;
  secret_key: string;
  skew: number;
  user_id: string;
  verified: boolean;
}

export interface AuthTotpUsers {
  app_id: Generated<string>;
  user_id: string;
}

export interface AuthUseridMapping {
  app_id: Generated<string>;
  external_user_id: string;
  external_user_id_info: string | null;
  supertokens_user_id: string;
}

export interface AuthUserLastActive {
  app_id: Generated<string>;
  last_active_time: Int8 | null;
  user_id: string;
}

export interface AuthUserMetadata {
  app_id: Generated<string>;
  user_id: string;
  user_metadata: string;
}

export interface AuthUserRoles {
  app_id: Generated<string>;
  role: string;
  tenant_id: Generated<string>;
  user_id: string;
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
  service_account_id: string | null;
  state: Generated<Json>;
  workflow_id: string;
}

export interface UserMeta {
  created_at: Generated<Timestamp>;
  first_name: string | null;
  id: Generated<string>;
  last_name: string | null;
  name: string | null;
  picture: string | null;
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
  name: Generated<string>;
  project_id: string | null;
}

export interface WorkflowsUsageRecords {
  billing_period_id: string;
  id: Generated<string>;
  run_count: Generated<number>;
  workflow_id: string;
}

export interface DB {
  "auth.all_auth_recipe_users": AuthAllAuthRecipeUsers;
  "auth.app_id_to_user_id": AuthAppIdToUserId;
  "auth.apps": AuthApps;
  "auth.dashboard_user_sessions": AuthDashboardUserSessions;
  "auth.dashboard_users": AuthDashboardUsers;
  "auth.emailpassword_pswd_reset_tokens": AuthEmailpasswordPswdResetTokens;
  "auth.emailpassword_user_to_tenant": AuthEmailpasswordUserToTenant;
  "auth.emailpassword_users": AuthEmailpasswordUsers;
  "auth.emailverification_tokens": AuthEmailverificationTokens;
  "auth.emailverification_verified_emails": AuthEmailverificationVerifiedEmails;
  "auth.jwt_signing_keys": AuthJwtSigningKeys;
  "auth.key_value": AuthKeyValue;
  "auth.passwordless_codes": AuthPasswordlessCodes;
  "auth.passwordless_devices": AuthPasswordlessDevices;
  "auth.passwordless_user_to_tenant": AuthPasswordlessUserToTenant;
  "auth.passwordless_users": AuthPasswordlessUsers;
  "auth.role_permissions": AuthRolePermissions;
  "auth.roles": AuthRoles;
  "auth.session_access_token_signing_keys": AuthSessionAccessTokenSigningKeys;
  "auth.session_info": AuthSessionInfo;
  "auth.tenant_configs": AuthTenantConfigs;
  "auth.tenant_first_factors": AuthTenantFirstFactors;
  "auth.tenant_required_secondary_factors": AuthTenantRequiredSecondaryFactors;
  "auth.tenant_thirdparty_provider_clients": AuthTenantThirdpartyProviderClients;
  "auth.tenant_thirdparty_providers": AuthTenantThirdpartyProviders;
  "auth.tenants": AuthTenants;
  "auth.thirdparty_user_to_tenant": AuthThirdpartyUserToTenant;
  "auth.thirdparty_users": AuthThirdpartyUsers;
  "auth.totp_used_codes": AuthTotpUsedCodes;
  "auth.totp_user_devices": AuthTotpUserDevices;
  "auth.totp_users": AuthTotpUsers;
  "auth.user_last_active": AuthUserLastActive;
  "auth.user_metadata": AuthUserMetadata;
  "auth.user_roles": AuthUserRoles;
  "auth.userid_mapping": AuthUseridMapping;
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
