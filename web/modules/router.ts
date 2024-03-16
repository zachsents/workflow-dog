import { useRouter } from "next/router"
import { useCallback, useEffect } from "react"


/**
 * Hook that provides a query parameter and a setter.
 */
export function useQueryParam(key: string, {
    defaultValue,
    method = "replace",
}: {
    defaultValue?: any
    method?: "replace" | "push"
} = {}) {
    const router = useRouter()
    const value = router.query[key] as string

    const setValue = useCallback((newValue: string) => {
        router[method]({
            query: { ...router.query, [key]: newValue },
        }, undefined, {
            shallow: true,
        })
    }, [router, key, method])

    useEffect(() => {
        if (router.isReady && value === undefined && defaultValue !== undefined)
            setValue(defaultValue)
    }, [router.isReady, defaultValue])

    return [value, setValue] as const
}