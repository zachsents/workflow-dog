import type { Session, User } from "@supabase/supabase-js"
import { UseQueryResult, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect } from "react"


/**
 * Returns the current user wrapped in a query result.
 */
export function useUser(): UseQueryResult<User> {
    return useQuery({
        queryKey: ["currentUser"],
        enabled: false,
    })
}


/**
 * Returns the current session wrapped in a query result.
 */
export function useSession(): UseQueryResult<Session> {
    return useQuery({
        queryKey: ["currentSession"],
        enabled: false,
    })
}


/**
 * Redirects to the given path if the user is not signed in.
 */
export function useMustBeSignedIn(redirect = "/login") {
    const router = useRouter()
    const { data: user } = useUser()
    const hasEmitted = user !== undefined

    useEffect(() => {
        if (hasEmitted && !user && redirect)
            router.push(redirect)
    }, [user?.id, hasEmitted, redirect])

    return user
}


/**
 * Redirects to the given path if the user is signed in.
 */
export function useMustNotBeSignedIn(redirect = "/") {
    const router = useRouter()
    const { data: user } = useUser()
    const hasEmitted = user !== undefined

    useEffect(() => {
        if (hasEmitted && user && redirect)
            router.push(redirect)
    }, [user?.id, hasEmitted, redirect])
}
