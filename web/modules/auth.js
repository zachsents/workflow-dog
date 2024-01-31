import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/router"
import { useEffect } from "react"


export function useUser() {
    return useQuery({
        queryKey: ["currentUser"],
        enabled: false,
    })
}


export function useSession() {
    return useQuery({
        queryKey: ["currentSession"],
        enabled: false,
    })
}


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


export function useMustNotBeSignedIn(redirect = "/") {
    const router = useRouter()
    const { data: user } = useUser()
    const hasEmitted = user !== undefined

    useEffect(() => {
        if (hasEmitted && user && redirect)
            router.push(redirect)
    }, [user?.id, hasEmitted, redirect])
}
