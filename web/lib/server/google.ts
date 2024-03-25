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

export function parent(resourcePath: string) {
    return `projects/${PROJECT}/locations/${LOCATION}/${resourcePath}`
}