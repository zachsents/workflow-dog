import { useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase, throwOnPolicyViolation } from "./supabase"
import { useNotifications } from "./notifications"


/**
 * @param {(supa: import("@supabase/supabase-js").SupabaseClient) => any} queryCreator
 * @param {import("@tanstack/react-query").UseMutationOptions & { invalidateKey: string[], notification: import("./notifications").NotificationOptions, enabled: boolean, showErrorNotification: boolean, throwSelectKey: string }} options
 */
export function useDatabaseMutation(queryCreator, {
    invalidateKey,
    notification,
    enabled = true,
    showErrorNotification = false,
    throwSelectKey,
    ...mutationOptions
}) {

    const queryClient = useQueryClient()
    const { notify } = useNotifications()

    return useMutation({
        mutationFn: async (...args) => {
            if (!enabled)
                return

            let query = queryCreator(supabase, ...args)
                .throwOnError()

            if (throwSelectKey) {
                query = throwOnPolicyViolation(query, throwSelectKey)
            }

            await query

            if (invalidateKey)
                await queryClient.invalidateQueries({
                    queryKey: invalidateKey,
                })

            if (notification)
                notify({
                    title: "Success!",
                    ...typeof notification === "object" && notification,
                })
        },
        onError: err => {
            console.error(err)

            if (showErrorNotification)
                notify({
                    message: err.message,
                    classNames: { icon: "!bg-danger" },
                })
        },
        ...mutationOptions,
    })
}