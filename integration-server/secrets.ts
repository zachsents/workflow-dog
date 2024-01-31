import { GoogleAuth } from "google-auth-library"
import { project_id as projectId } from "./service-account.json"


const auth = new GoogleAuth({
    // See https://cloud.google.com/secret-manager/docs/reference/rest/v1beta1/projects.secrets/get#authorization-scopes
    scopes: "https://www.googleapis.com/auth/cloud-platform",
    keyFile: "./service-account.json"
})

async function getAccessToken() {
    const client = await auth.getClient()
    const { token } = await client.getAccessToken()
    return token
}

export async function getSecret(name: string) {
    console.debug("Getting secret", name)

    const encodedSecret = await fetch(`https://secretmanager.googleapis.com/v1beta1/projects/${projectId}/secrets/${name}/versions/latest:access`, {
        headers: {
            Authorization: `Bearer ${await getAccessToken()}`
        }
    })
        .then(res => res.json())
        .then(res => res.error ? Promise.reject(res.error) : res.payload.data)

    return Buffer.from(encodedSecret, "base64").toString()
}
