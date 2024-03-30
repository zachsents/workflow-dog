import { type UseMutationOptions, useMutation, useQueryClient, type InvalidateQueryFilters } from "@tanstack/react-query"
import { useSession } from "./auth"


export function useApiMutation(endpoint: string, {
    method = "POST",
    fetchOptions = {},
    authenticated = true,
    mutationOptions = {},
    invalidateQueries,
}: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
    fetchOptions?: FetchRequestInit
    authenticated?: boolean
    mutationOptions?: UseMutationOptions
    invalidateQueries?: InvalidateQueryFilters
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
                        "Authorization": `Bearer ${session?.access_token}`,
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
        ...mutationOptions,
    })
}