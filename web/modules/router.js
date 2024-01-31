import { useRouter } from "next/router"
import { useEffect } from "react"
import { useCallback } from "react"


/**
 * @param {string} key
 * @param {object} options
 * @param {*} options.defaultValue
 * @param {"replace" | "push"} options.method
 */
export function useQueryParam(key, {
    defaultValue,
    method = "replace",
} = {}) {
    const router = useRouter()
    const value = router.query[key]

    const setValue = useCallback((newValue) => {
        router[method]({
            query: { ...router.query, [key]: newValue },
        }, undefined, {
            shallow: true,
        })
    })

    useEffect(() => {
        if (router.isReady && value === undefined && defaultValue !== undefined)
            setValue(defaultValue)
    }, [router.isReady, defaultValue])

    return [value, setValue]
}