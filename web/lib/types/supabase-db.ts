export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      integration_accounts: {
        Row: {
          access_token: string | null
          created_at: string
          creator: string | null
          display_name: string | null
          id: string
          profile: Json | null
          refresh_token: string | null
          scopes: string[] | null
          service_id: string | null
          service_user_id: string | null
          token: Json | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          creator?: string | null
          display_name?: string | null
          id?: string
          profile?: Json | null
          refresh_token?: string | null
          scopes?: string[] | null
          service_id?: string | null
          service_user_id?: string | null
          token?: Json | null
        }
        Update: {
          access_token?: string | null
          created_at?: string
          creator?: string | null
          display_name?: string | null
          id?: string
          profile?: Json | null
          refresh_token?: string | null
          scopes?: string[] | null
          service_id?: string | null
          service_user_id?: string | null
          token?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "public_integration_accounts_creator_fkey"
            columns: ["creator"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_integration_accounts_creator_fkey"
            columns: ["creator"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_accounts_teams: {
        Row: {
          integration_account_id: string
          team_id: string
        }
        Insert: {
          integration_account_id: string
          team_id: string
        }
        Update: {
          integration_account_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_accounts_teams_integration_account_id_fkey"
            columns: ["integration_account_id"]
            isOneToOne: false
            referencedRelation: "integration_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "integration_accounts_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          created_at: string
          email: string
          status: Database["public"]["Enums"]["team_invitation_status"] | null
          team_id: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          status?: Database["public"]["Enums"]["team_invitation_status"] | null
          team_id: string
          token?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          status?: Database["public"]["Enums"]["team_invitation_status"] | null
          team_id?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_team"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          creator: string | null
          id: string
          is_personal: boolean
          name: string
        }
        Insert: {
          created_at?: string
          creator?: string | null
          id?: string
          is_personal: boolean
          name?: string
        }
        Update: {
          created_at?: string
          creator?: string | null
          id?: string
          is_personal?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_creator_fkey"
            columns: ["creator"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_creator_fkey"
            columns: ["creator"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users_teams: {
        Row: {
          roles: Database["public"]["Enums"]["user_team_role"][] | null
          team_id: string
          user_id: string
        }
        Insert: {
          roles?: Database["public"]["Enums"]["user_team_role"][] | null
          team_id: string
          user_id: string
        }
        Update: {
          roles?: Database["public"]["Enums"]["user_team_role"][] | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_teams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_teams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_runs: {
        Row: {
          count: number | null
          created_at: string
          error_count: number | null
          finished_at: string | null
          has_errors: boolean | null
          id: string
          scheduled_for: string | null
          started_at: string | null
          state: Json
          status: Database["public"]["Enums"]["workflow_run_status"]
          trigger_data: Json | null
          workflow_id: string
        }
        Insert: {
          count?: number | null
          created_at?: string
          error_count?: number | null
          finished_at?: string | null
          has_errors?: boolean | null
          id?: string
          scheduled_for?: string | null
          started_at?: string | null
          state?: Json
          status?: Database["public"]["Enums"]["workflow_run_status"]
          trigger_data?: Json | null
          workflow_id: string
        }
        Update: {
          count?: number | null
          created_at?: string
          error_count?: number | null
          finished_at?: string | null
          has_errors?: boolean | null
          id?: string
          scheduled_for?: string | null
          started_at?: string | null
          state?: Json
          status?: Database["public"]["Enums"]["workflow_run_status"]
          trigger_data?: Json | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          creator: string | null
          graph: Json | null
          id: string
          is_enabled: boolean
          last_edited_at: string | null
          last_ran_at: string | null
          name: string | null
          team_id: string | null
          trigger: Json | null
        }
        Insert: {
          created_at?: string
          creator?: string | null
          graph?: Json | null
          id?: string
          is_enabled?: boolean
          last_edited_at?: string | null
          last_ran_at?: string | null
          name?: string | null
          team_id?: string | null
          trigger?: Json | null
        }
        Update: {
          created_at?: string
          creator?: string | null
          graph?: Json | null
          id?: string
          is_enabled?: boolean
          last_edited_at?: string | null
          last_ran_at?: string | null
          name?: string | null
          team_id?: string | null
          trigger?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "workflows_creator_fkey"
            columns: ["creator"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_creator_fkey"
            columns: ["creator"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflows_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      users: {
        Row: {
          email: string | null
          id: string | null
          name: string | null
          photo_url: string | null
        }
        Insert: {
          email?: string | null
          id?: string | null
          name?: never
          photo_url?: never
        }
        Update: {
          email?: string | null
          id?: string | null
          name?: never
          photo_url?: never
        }
        Relationships: []
      }
    }
    Functions: {
      are_users_on_same_team: {
        Args: {
          user_id_1: string
          user_id_2: string
        }
        Returns: boolean
      }
      does_user_exist: {
        Args: {
          _email: string
        }
        Returns: boolean
      }
      get_team_members: {
        Args: {
          team_id_arg: string
        }
        Returns: {
          member_id: string
          member_email: string
          member_roles: Database["public"]["Enums"]["user_team_role"][]
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _team_id: string
          role: Database["public"]["Enums"]["user_team_role"]
        }
        Returns: boolean
      }
      invite_user_to_team: {
        Args: {
          _email: string
          _team_id: string
        }
        Returns: undefined
      }
      is_user_on_team: {
        Args: {
          _user_id: string
          _team_id: string
        }
        Returns: boolean
      }
      is_user_on_team_with_role: {
        Args: {
          user_id: string
          team_id: string
          role: Database["public"]["Enums"]["user_team_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      team_invitation_status: "requested" | "pending"
      user_team_role: "viewer" | "editor"
      workflow_node_run_status:
        | "pending"
        | "running"
        | "paused"
        | "completed"
        | "failed"
      workflow_run_status:
        | "pending"
        | "running"
        | "scheduled"
        | "canceled"
        | "completed"
        | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
