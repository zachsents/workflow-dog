import { createBrowserClient } from "@supabase/ssr"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo } from "react"


export function getSupabaseBrowserClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}


export function useSupabaseBrowser() {
    return useMemo(getSupabaseBrowserClient, [])
}


/**
 * Need this as a component instead of a custom hook so it can be
 * nested in the QueryClientProvider.
 */
export function SupabaseSetup() {

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

    return null
}