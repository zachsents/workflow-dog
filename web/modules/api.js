import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "./auth"


/**
 * @param {string} endpoint
 * @param {object} options
 * @param {"GET" | "POST" | "PUT" | "PATCH" | "DELETE"} options.method
 * @param {FetchRequestInit} options.fetchOptions
 * @param {boolean} options.authenticated
 * @param {import("@tanstack/react-query").UseMutationOptions} options.mutationOptions
 * @param {string[]} options.invalidateQueries
 */
export function useApiMutation(endpoint, {
    method = "POST",
    fetchOptions = {},
    authenticated = true,
    mutationOptions = {},
    invalidateQueries,
} = {}) {
    const { data: session } = useSession()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (body) => {

            const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`)

            const response = await fetch(url.toString(), {
                method: method.toUpperCase(),
                headers: {
                    "Content-Type": "application/json",
                    ...authenticated && {
                        "Authorization": `Bearer ${session.accessToken}`,
                    }
                },
                body: JSON.stringify(body),
                ...fetchOptions,
            }).then(res => res.ok ? res.status == 204 ? undefined : res.json() : Promise.reject(res.text()))

            if (invalidateQueries) {
                queryClient.invalidateQueries(invalidateQueries)
            }

            return response
        },
        enabled: !!session,
        ...mutationOptions,
    })
}