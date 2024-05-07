"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

export default function ParamToaster() {
    const router = useRouter()
    const pathname = usePathname()
    const message = useSearchParams().get("tm")

    useEffect(() => {
        if (message) {
            router.replace(pathname)
            toast.info(message, { id: "param-toaster" })
        }
    }, [message])

    return null
}