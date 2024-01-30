import { SecretManagerServiceClient } from "@google-cloud/secret-manager"

const secretClient = new SecretManagerServiceClient({
    keyFile: "./service-account.json",
})

const projectId = await secretClient.getProjectId()

export async function getSecret(name) {
    const [version] = await secretClient.accessSecretVersion({
        name: `projects/${projectId}/secrets/${name}/versions/latest`,
    })

    version.payload.data

    const payload = version.payload.data.toString()
    return payload
}
