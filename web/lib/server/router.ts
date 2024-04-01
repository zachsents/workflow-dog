import "server-only"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"


export function errorRedirect(message: string, {
    nextResponse,
}: {
    nextResponse?: boolean
} = {}) {
    const url = `/error?${new URLSearchParams({ msg: message })}`

    if (nextResponse)
        return NextResponse.redirect(url)
    else
        redirect(url)
}

export function errorResponse(message: string, status: number) {
    return NextResponse.json({ error: { message } }, { status })
}
