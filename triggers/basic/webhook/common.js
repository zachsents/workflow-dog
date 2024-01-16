import { Type } from "shared/types.js"

export default {
    name: "Webhook (Async URL)",
    whenName: "When a webhook URL is requested",
    description: "Triggered by a request to a URL. Responds as soon as the request is received.",
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
    }
}