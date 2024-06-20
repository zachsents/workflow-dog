import { useSession as useSessionNextAuth } from "next-auth/react"
import type { CustomSession } from "../server/auth"


export function useSession() {
    const { data, status } = useSessionNextAuth()
    const session = data as CustomSession | null | undefined
    return { session, status, user: session?.user }
}
