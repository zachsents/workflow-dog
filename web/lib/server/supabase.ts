import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@web/lib/types/supabase-db"
import jwt, { JwtPayload } from "jsonwebtoken"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { NextResponse, type NextRequest } from "next/server"
import "server-only"


/*
    Apparently this file should only use edge runtime stuff
*/


export function supabaseServer() {
    const cookieStore = cookies()

    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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


export async function supabaseServerAdmin() {
    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!,
        // await getSecret("SUPABASE_SERVICE_KEY", false),
    )
}


export function supabaseVerifyJWT(
    req: Request,
    shouldThrow = true
): typeof shouldThrow extends true ? JwtPayload : (JwtPayload | false) {

    const token = req.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) {
        if (shouldThrow)
            throw new Error("No token provided")
        else
            return false
    }

    const verify = () => jwt.verify(token, process.env.SUPABASE_JWT_SECRET!) as JwtPayload

    if (shouldThrow)
        return verify()

    try {
        return verify()
    }
    catch (error) {
        return false
    }
}


export async function updateSession(request: NextRequest) {
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


export async function requireLogin() {
    const supabase = supabaseServer()
    const { data, error } = await supabase.auth.getUser()

    if (!error && data?.user)
        return data.user

    redirect("/login")
}


const commonMessages = {
    "PGRST116": "You don't have permission.",
}

export interface RemapErrorReturn {
    error: {
        message: string
        [key: string]: any
    }
}

export function remapError(result: any, messages: Record<string, string | false> = {}): RemapErrorReturn | null {
    if (!result.error)
        return null

    const message = {
        ...commonMessages,
        ...messages,
    }[result.error.code] ?? result.error.message

    if (message === false)
        return null

    return {
        error: {
            ...result.error,
            message,
        }
    }
}