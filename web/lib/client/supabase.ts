import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@web/lib/types/supabase-db"
import { useMemo } from "react"


export function getSupabaseBrowserClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}

export function useSupabaseBrowser() {
    return useMemo(getSupabaseBrowserClient, [])
}