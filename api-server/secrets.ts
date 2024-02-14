import { GoogleAuth } from "google-auth-library"
import { project_id as projectId } from "./service-account.json"


const auth = new GoogleAuth({
    // See https://cloud.google.com/secret-manager/docs/reference/rest/v1beta1/projects.secrets/get#authorization-scopes
    scopes: "https://www.googleapis.com/auth/cloud-platform",
    keyFile: "./service-account.json",
})



export async function getAccessToken() {
    const client = await auth.getClient()
    const { token } = await client.getAccessToken()
    return token
}

export async function getSecret(name: string, useLocalIfAvailable = true) {
    console.debug("Getting secret", name)

    if (process.env.NODE_ENV === "development" && useLocalIfAvailable) {
        const doesLocalSecretExist = await fetch(`https://secretmanager.googleapis.com/v1beta1/projects/${projectId}/secrets/${name}_LOCAL`, {
            headers: {
                Authorization: `Bearer ${await getAccessToken()}`
            }
        }).then(res => res.ok)

        if (doesLocalSecretExist) {
            console.debug("\tUsing local secret")
            name += "_LOCAL"
        }
        else {
            console.debug("\tLocal secret not found. Using production version.")
        }
    }

    const encodedSecret = await fetch(`https://secretmanager.googleapis.com/v1beta1/projects/${projectId}/secrets/${name}/versions/latest:access`, {
        headers: {
            Authorization: `Bearer ${await getAccessToken()}`
        }
    })
        .then(res => res.json())
        .then(res => res.error ? Promise.reject(res.error) : res.payload.data)

    return Buffer.from(encodedSecret, "base64").toString()
}


export { projectId }