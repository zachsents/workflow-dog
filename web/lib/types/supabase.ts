import { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./supabase-db"

export type TypedSupabaseClient = SupabaseClient<Database>