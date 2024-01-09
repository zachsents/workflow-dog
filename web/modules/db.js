import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase, throwOnPolicyViolation } from "./supabase"
import { useNotifications } from "./notifications"


/**
 * @param {(supa: import("@supabase/supabase-js").SupabaseClient) => any} queryCreator
 * @param {import("@tanstack/react-query").UseMutationOptions & { invalidateKey: string[], notification: import("./notifications").NotificationOptions }} options
 */
export function useDatabaseMutation(queryCreator, {
    invalidateKey,
    notification,
    ...mutationOptions
}) {

    const queryClient = useQueryClient()
    const { notify } = useNotifications()

    return useMutation({
        mutationFn: async () => {
            await throwOnPolicyViolation(
                queryCreator(supabase)
                    .throwOnError()
            )

            if (invalidateKey)
                await queryClient.invalidateQueries({
                    queryKey: invalidateKey,
                })

            if (notification)
                notify({
                    title: "Success!",
                    ...notification,
                })
        },
        onError: err => console.error(err),
        ...mutationOptions,
    })
}