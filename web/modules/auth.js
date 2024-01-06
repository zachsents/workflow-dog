import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { supabase } from "./supabase"
import { deepCamelCase } from "./util"


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


export function useUserMetadata() {

    const { data: user } = useUser()

    return useQuery({
        queryFn: async () => {
            const { data } = await supabase
                .from("users")
                .select("*")
                .eq("id", user.id)
                .limit(1)
                .single()
                .throwOnError()
            return deepCamelCase(data)
        },
        queryKey: ["userMetadata", user?.id],
        enabled: !!user?.id,
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
