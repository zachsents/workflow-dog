import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "./config"


export type CustomSessionUser = {
    id: string
    email: string
    name?: string | null
    image?: string | null
    firstName?: string | null
    lastName?: string | null
}

export type CustomSession = {
    user: CustomSessionUser
}

export async function getSession() {
    return await getServerSession<typeof authOptions, CustomSession>(authOptions)
}

export async function getUser() {
    const session = await getSession()
    return session?.user
}

export async function requireLogin(options?: {
    params?: Record<string, string>
    beforeRedirect?: () => void
}) {
    const session = await getSession()

    if (!session) {
        options?.beforeRedirect?.()
        const url = options?.params
            ? `/login?${new URLSearchParams(options?.params).toString()}`
            : "/login"
        redirect(url)
    }

    return session
}

