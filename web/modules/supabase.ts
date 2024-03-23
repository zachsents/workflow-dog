import { createClient } from "@supabase/supabase-js"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { deepCamelCase } from "./util"


export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)


export function useSupabase() {
    const queryClient = useQueryClient()

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.debug("Supabase Auth Event:", event)

            if (event === "SIGNED_OUT") {
                queryClient.setQueryData(["currentUser"], null)
                queryClient.setQueryData(["currentSession"], null)
                return
            }
            queryClient.setQueryData(["currentUser"], deepCamelCase(session?.user ?? null))
            queryClient.setQueryData(["currentSession"], deepCamelCase(session ?? null))
        })
        return () => subscription.unsubscribe()
    }, [])
}

export function SupabaseController() {
    useSupabase()
}


export async function throwOnPolicyViolation(queryPromise: any, select = "id") {
    const response = await queryPromise.select(select)
    if (!response.data || response.data.length === 0) {
        throw new Error("Didn't pass policy check")
    }
    return response
}