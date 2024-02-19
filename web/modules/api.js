import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "./auth"


export function useApiMutation(endpoint, {
    method = "post",
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
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...authenticated && {
                        "Authorization": `Bearer ${session.accessToken}`,
                    }
                },
                body: JSON.stringify(body),
                ...fetchOptions,
            }).then(res => res.ok ? res.status == 204 ? undefined : res.json() : Promise.reject(res.text()))

            if(invalidateQueries) {
                queryClient.invalidateQueries(invalidateQueries)
            }

            return response
        },
        enabled: !!session,
        ...mutationOptions,
    })
}