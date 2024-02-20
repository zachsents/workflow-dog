import { getAccessToken, projectId } from "./secrets.js"
import { checkForErrorThenJson } from "./util.js"


export async function fetchGoogleApi({
    api,
    version,
    project = projectId,
    location = "us-central1",
    resourcePath,
    verb,
    method = "GET",
    params,
}: GoogleFetchOptions = {} as GoogleFetchOptions, body?: object | GoogleFetchBodyCreator) {

    resourcePath = resourcePath.replace(/^\//, "")
    const fullResourcePath = `projects/${project}/locations/${location}/${resourcePath}`

    const resolvedBody: object = typeof body === "function" ?
        await body({ fullResourcePath }) :
        body

    const url = new URL(`https://${api}.googleapis.com/${version}/${fullResourcePath}${verb ? `:${verb}` : ""}`)

    if(params) {
        for(const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value)
        }
    }

    return await fetch(url.toString(), {
        method,
        headers: {
            Authorization: `Bearer ${await getAccessToken()}`,
            ...resolvedBody && { "Content-Type": "application/json" },
        },
        ...resolvedBody && { body: JSON.stringify(resolvedBody) },
    })
        .then(checkForErrorThenJson)
        .then(res => res.error ? Promise.reject(res.error) : res)
}


type GoogleFetchOptions = {
    api: string
    version: string

    /** Defaults to project ID from service-account.json */
    project?: string

    /** Defaults to `us-central1` */
    location?: string

    /** 
     * Gets appended to project ID and location: 
     * `projects/${projectId}/locations/${location}/${resourcePath}`
     * 
     * Leading `/` is removed
     */
    resourcePath: string

    /** Do not include leading `:` */
    verb?: string

    /** Defaults to `GET` */
    method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT"

    params?: Record<string, string>
}

type GoogleFetchBodyCreator = (options: { fullResourcePath: string }) => object | Promise<object>