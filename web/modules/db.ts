import { RealtimePostgresChangesFilter } from "@supabase/supabase-js"
import { useMutation, useQueryClient, type QueryKey, type UseMutationOptions, MutationFunction } from "@tanstack/react-query"
import { useSupabaseBrowser } from "@web/lib/client/supabase"
import { TypedSupabaseClient } from "@web/lib/types/supabase"
import "client-only"
import { useEffect } from "react"
import { toast } from "sonner"


type SupabaseMutationQueryCreator = (supabase: TypedSupabaseClient, ...args: any[]) => ReturnType<ReturnType<TypedSupabaseClient["from"]>["insert" | "update" | "upsert" | "delete"]>

interface UseSupabaseMutationOptions extends Omit<UseMutationOptions, "mutationFn" | "onError"> {
    invalidateKey?: QueryKey
    notification?: string | { title: string, message: string }
    enabled?: boolean
    showErrorNotification?: boolean
}

export function useSupabaseMutation(queryCreator: SupabaseMutationQueryCreator, {
    invalidateKey,
    notification,
    enabled = true,
    showErrorNotification = false,
    ...mutationOptions
}: UseSupabaseMutationOptions = {}) {

    const supabase = useSupabaseBrowser()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (args?: any[] | any | void) => {
            if (!enabled)
                return

            const argsToSpread = args === undefined
                ? []
                : Array.isArray(args)
                    ? args
                    : [args]

            const query = await queryCreator(supabase, ...argsToSpread)
                .select("*")
                .single()

            if (query.error) {
                throw query.error.code === "PGRST116"
                    ? new Error("Policy violation")
                    : query.error
            }

            if (invalidateKey)
                await queryClient.invalidateQueries({ queryKey: invalidateKey })

            if (notification)
                toast.success("Success!", {
                    description: "The workflow has been created successfully.",
                })
        },
        onError: (err) => {
            console.error(err)
            if (showErrorNotification)
                toast.error(err.message || "Error!")
        },
        ...mutationOptions,
    })
}


type RealtimePostresEventType = "*" | "INSERT" | "UPDATE" | "DELETE"

export function useInvalidateOnDatabaseChange<T extends RealtimePostresEventType>(
    postgresFilterOptions: RealtimePostgresChangesFilter<T>,
    invalidateKey: QueryKey,
) {
    const queryClient = useQueryClient()
    const supabase = useSupabaseBrowser()

    useEffect(() => {
        const channel = supabase
            .channel("realtime-db-query")
            // seems like there's a bug in the types
            .on("postgres_changes" as any, postgresFilterOptions, () => {
                console.debug("Realtime query invalidated", invalidateKey)
                queryClient.invalidateQueries({
                    queryKey: invalidateKey,
                })
            })
            .subscribe()

        return () => void channel.unsubscribe()
    }, [
        JSON.stringify(postgresFilterOptions),
        JSON.stringify(invalidateKey)
    ])
}