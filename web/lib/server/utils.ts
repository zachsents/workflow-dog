
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

export function throwMissingEnvVariableError(name: string): never {
    throw new Error(`Please set ${name} as an environment variable(s)`)
}


/**
 * Checks if the given environment variable is set and returns it.
 */
export function useEnvVar(varName: string) {
    if (!process.env[varName])
        throwMissingEnvVariableError(varName)

    return process.env[varName]!
}


/**
 * Checks if the given environment variables are set and returns them as an object.
 * Useful for type-safe access to environment variables.
 */
export function useEnvVars<T extends string[]>(...varNames: T) {
    const missing = varNames.filter(v => !process.env[v])

    if (missing.length > 0)
        throwMissingEnvVariableError(missing.join(", "))

    return Object.fromEntries(varNames.map(v => [v, process.env[v]!])) as { [key in T[number]]: string }
}
