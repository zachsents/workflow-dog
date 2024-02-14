
export default {
    name: "Request",
    whenName: "When a URL is requested",
    description: "Triggered by a request to a URL. Responds after the script has finished running.",
    inputs: {
        method: {
            name: "Method",
            type: "data-type:basic.string",
        },
        headers: {
            name: "Headers",
            type: "data-type:basic.object",
        },
        params: {
            name: "Query Parameters",
            type: "data-type:basic.object",
        },
        body: {
            name: "Body",
            type: "data-type:basic.string",
        },
    },
    outputs: {
        status: {
            name: "Status Code",
            type: "data-type:basic.number",
        },
        headers: {
            name: "Headers",
            type: "data-type:basic.object",
        },
        body: {
            name: "Body",
            type: "data-type:basic.string",
        },
    },
}