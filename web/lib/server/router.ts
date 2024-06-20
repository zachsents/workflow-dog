import { redirect } from "next/navigation"
import { NextResponse } from "next/server"
import "server-only"
import { getVerifiedSession } from "./supabase"


export function errorRedirect(message: string) {
    const url = `/error?${new URLSearchParams({ msg: message })}`
    redirect(url)
}


export function errorResponse(message: string, status: number, extra?: any) {
    return NextResponse.json({ error: { message, ...extra } }, { status })
}


interface AssertOrRedirectOptions {
    params?: Record<string, string>
    beforeRedirect?: () => void
}

export function assertOrRedirect(condition: boolean, route: string, {
    beforeRedirect,
    params: passedParams,
}: AssertOrRedirectOptions = {}) {
    if (condition)
        return

    const [pathname, paramStr] = route.split("?")

    const urlParams = new URLSearchParams(paramStr)
    if (passedParams)
        Object.entries(passedParams).forEach(([k, v]) => urlParams.set(k, v))

    beforeRedirect?.()
    redirect(`${pathname}?${urlParams.toString()}`)
}


export async function requireLogin(options?: AssertOrRedirectOptions) {
    const session = await getVerifiedSession()
    assertOrRedirect(!!session, "/login", options)
    return session!
}