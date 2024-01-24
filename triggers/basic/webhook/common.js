
export default {
    name: "Webhook (Async URL)",
    whenName: "When a webhook URL is requested",
    description: "Triggered by a request to a URL. Responds as soon as the request is received.",
    inputs: {
        method: {
            label: "Method",
            type: "data-type:basic.string",
        },
        url: {
            label: "URL",
            type: "data-type:basic.string",
        },
        headers: {
            label: "Headers",
            type: "data-type:basic.object",
        },
        body: {
            label: "Body",
            type: "data-type:basic.string",
        },
        params: {
            label: "Query Parameters",
            type: "data-type:basic.object",
        },
    }
}