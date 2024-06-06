
export function getAuthTokenFromHeader(header: string) {
    if (header.startsWith("Bearer "))
        return header.replace(/^Bearer /, "")

    if (header.startsWith("Basic "))
        return header.replace(/^Basic /, "")

    return header
}

export function getAuthTokenFromRequest(req: Request) {
    const authHeader = req.headers.get("Authorization")
    return authHeader
        ? getAuthTokenFromHeader(authHeader)
        : null
}