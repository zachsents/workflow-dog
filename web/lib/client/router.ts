import { useRouter } from "next/navigation"
import { useCallback } from "react"


export function useErrorRedirect() {
    const router = useRouter()

    return useCallback((message: string) => {
        router.push(`/error?${new URLSearchParams({ msg: message })}`)
    }, [router])
}