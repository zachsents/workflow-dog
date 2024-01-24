
export default {
    name: "Webhook (Async URL)",
    whenName: "When a webhook URL is requested",
    description: "Triggered by a request to a URL. Responds as soon as the request is received.",
    inputs: {
        method: {
            name: "Method",
            type: "data-type:basic.string",
        },
        url: {
            name: "URL",
            type: "data-type:basic.string",
        },
        headers: {
            name: "Headers",
            type: "data-type:basic.object",
        },
        body: {
            name: "Body",
            type: "data-type:basic.string",
        },
        params: {
            name: "Query Parameters",
            type: "data-type:basic.object",
        },
    }
}