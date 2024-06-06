import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import jwt, { type JwtPayload } from "jsonwebtoken"
import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"
import "server-only"
import { getAuthTokenFromRequest } from "./utils"


/**
 * Creates in instance of the Supabase client for server-side use.
 * Suitable for use in server components, as well as API routes (including
 * TRPC procedures).
 */
export function supabaseServer() {
    const cookieStore = cookies()

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL)
        throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set")

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set")

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options })
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {
                        // The `delete` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}


/**
 * Creates an admin instance of the Supabase client for server-side use.
 * Make sure to always perform some other form of authentication before
 * using this function, as it bypasses all Supabase security rules.
 */
export async function supabaseServerAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!,
    )
}


type SessionPayload = {
    aud: string
    exp: number
    iat: number
    iss: string
    sub: string
    email: string
    phone: string
    app_metadata: {
        provider: string
        providers: string[]
    }
    user_metadata: {
        avatar_url: string
        email: string
        email_verified: boolean
        full_name: string
        iss: string
        name: string
        phone_verified: boolean
        picture: string
        provider_id: string
        sub: string
    }
    role: SupabaseJWTRole
    aal: string
    amr: Array<{
        method: string
        timestamp: number
    }>
    user_id: string
    session_id: string
    is_anonymous: boolean
}


export async function getVerifiedSession() {
    const supabase = supabaseServer()

    const session = await supabase.auth.getSession()
        .then(res => res.data.session)

    if (!session)
        return null

    if (!process.env.SUPABASE_JWT_SECRET)
        throw new Error("SUPABASE_JWT_SECRET is not set")

    try {
        const decoded = jwt.verify(session.access_token, process.env.SUPABASE_JWT_SECRET) as JwtPayload
        return {
            ...decoded,
            user_id: decoded.sub,
        } as SessionPayload
    }
    catch (err) {
        console.debug("JWT verification failed", err)
        return null
    }
}


export async function getCurrentUser() {
    const supabase = supabaseServer()
    return supabase.auth.getUser()
        .then(res => res.data.user)
}

type SupabaseJWTRole = "authenticated" | "anon" | "service_role"

type SupabaseJWTPayload = {
    iss: string
    ref: string
    role: SupabaseJWTRole
    iat: number
    exp: number
}

export function supabaseVerifyJWT(requestOrToken: Request | string): { verified: false } | { verified: true, payload: SupabaseJWTPayload } {

    const token = typeof requestOrToken === "string"
        ? requestOrToken
        : getAuthTokenFromRequest(requestOrToken)

    if (!token)
        return { verified: false }

    try {
        const payload = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!) as SupabaseJWTPayload
        return { verified: true, payload }
    }
    catch (err) {
        console.debug("JWT verification failed", err)
        return { verified: false }
    }
}


export async function supabaseSessionRefreshMiddleware(request: NextRequest) {
    console.debug("supabase/updateSession")

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    await supabase.auth.getUser()

    return response
}
