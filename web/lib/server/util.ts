import "server-only"

export async function checkForErrorThenJson(res: Response) {
    if (!res.ok) {
        console.debug(res)
        console.debug(`Body:\n${await res.text()}`)
        throw new Error(`Failed to fetch: ${res.statusText}`)
    }
    return res.json()
}
