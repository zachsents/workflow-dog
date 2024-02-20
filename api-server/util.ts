import mergeWith from "lodash.mergewith"


export const defaultAccountConfig = {
    scopeDelimiter: " ",
    state: false,
    scopes: [],
    allowAdditionalScopes: false,
    includeRedirectUriInTokenRequest: true,
}

export function redirectUri(host: string, serviceName: string) {
    return `${host.includes("localhost") ? "http" : "https"}://${host}/oauth2/connect/${serviceName}/callback`
}

export interface CustomSessionData {
    team_id?: string,
    state?: string,
    grant?: {
        provider: string,
        dynamic: {
            t: string,
        },
    }
}

export async function checkForErrorThenJson(res: Response) {
    if (!res.ok) {
        console.debug(res)
        console.debug(`Body:\n${await res.text()}`)
        throw new Error(`Failed to fetch: ${res.statusText}`)
    }
    return res.json()
}


export function replaceExpiresIn(token: { expires_in?: number }) {
    const { expires_in, ...rest } = token

    return {
        ...rest,
        ...expires_in != null && { expires_at: new Date(Date.now() + (expires_in || 0) * 1000).toISOString() }
    }
}


export async function fetchProfile(profileUrl: string, accessToken: string) {
    return fetch(profileUrl, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    }).then(checkForErrorThenJson)
}


export function mergeObjectsOverwriteArrays(a: any, b: any) {
    return mergeWith({}, a, b, (objValue, srcValue) => {
        if (Array.isArray(objValue) && Array.isArray(srcValue))
            return srcValue
    })
}
