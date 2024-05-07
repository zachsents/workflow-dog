import { createBrowserClient } from "@supabase/ssr"
import { useQueryClient } from "@tanstack/react-query"
import type { Database } from "@web/lib/types/db"
import { useEffect, useMemo } from "react"


export function getSupabaseBrowserClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}


export function useSupabaseBrowser() {
    return useMemo(getSupabaseBrowserClient, [])
}


/**
 * Only used once in the component below.
 */
export function useSupabaseSetup() {
    const queryClient = useQueryClient()
    const supabase = useSupabaseBrowser()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.debug("Supabase Auth Event:", event)

            if (event === "SIGNED_OUT") {
                queryClient.setQueryData(["currentUser"], null)
                queryClient.setQueryData(["currentSession"], null)
                return
            }

            queryClient.setQueryData(["currentUser"], session?.user ?? null)
            queryClient.setQueryData(["currentSession"], session ?? null)
        })
        return () => subscription.unsubscribe()
    }, [])
}


/**
 * Need this as a component so it can be nested in the 
 * QueryClientProvider.
 */
export function SupabaseSetup() {
    useSupabaseSetup()
    return null
}