import { Type } from "shared/types.js"

export default {
    name: "Request (Sync URL)",
    whenName: "When a URL is requested",
    description: "Triggered by a request to a URL. Responds after the script has finished running.",
    workflowInputs: {
        method: {
            label: "Method",
            type: Type.String("GET", "POST", "PUT", "PATCH", "DELETE"),
        },
        url: {
            label: "URL",
            type: Type.String(),
        },
        headers: {
            label: "Headers",
            type: Type.Object(),
        },
        body: {
            label: "Body",
            type: Type.String(),
        },
        params: {
            label: "Query Parameters",
            type: Type.Object(),
        },
    },
    workflowOutputs: {
        status: {
            label: "Status Code",
            type: Type.Number(),
        },
        headers: {
            label: "Headers",
            type: Type.Object(),
        },
        body: {
            label: "Body",
            type: Type.String(),
        },
    },
}