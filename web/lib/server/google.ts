import { google } from "googleapis"
import serviceAccount from "@web/service-account.json"
import "server-only"


export const PROJECT = "workflow-dog"
export const LOCATION = "us-central1"

export function getAuth() {
    return new google.auth.GoogleAuth({
        credentials: serviceAccount,
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
}


export function parent(resourcePath: string, includeLocation = true) {
    let path = `projects/${PROJECT}`
    if (includeLocation)
        path += `/locations/${LOCATION}`
    return `${path}/${resourcePath}`
}


export async function getSecret(name: string, useLocalIfAvailable = true) {
    console.debug("Getting secret", name)

    const secretManager = google.secretmanager({
        version: "v1",
        auth: getAuth()
    })

    if (process.env.NODE_ENV === "development" && useLocalIfAvailable) {
        const doesLocalSecretExist = await secretManager.projects.secrets.get({
            name: parent(`secrets/${name}_LOCAL`, false),
        }).then(() => true).catch(() => false)

        if (doesLocalSecretExist) {
            console.debug("\tUsing local secret")
            name += "_LOCAL"
        }
        else {
            console.debug("\tLocal secret not found. Using production version.")
        }
    }

    const encodedSecret = await secretManager.projects.secrets.versions.access({
        name: parent(`secrets/${name}/versions/latest`, false),
    }).then(res => res.data.payload?.data)

    if (!encodedSecret)
        throw new Error(`Secret not found: ${name}`)

    return Buffer.from(encodedSecret, "base64").toString()
}