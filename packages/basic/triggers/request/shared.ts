import { createSharedTriggerDefinition } from "@pkg/types"


export default createSharedTriggerDefinition({
    name: "URL Request",
    whenName: "When a URL is visited",
    description: "Triggered when someone or something requests your workflow's URL. This is useful for creating webhooks.",
    inputs: {
        method: {
            name: "Method",
            type: "https://data-types.workflow.dog/basic/string",
        },
        headers: {
            name: "Headers",
            type: "https://data-types.workflow.dog/basic/object",
        },
        params: {
            name: "Query Parameters",
            type: "https://data-types.workflow.dog/basic/object",
        },
        body: {
            name: "Body",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    outputs: {
        status: {
            name: "Status Code",
            type: "https://data-types.workflow.dog/basic/number",
        },
        headers: {
            name: "Headers",
            type: "https://data-types.workflow.dog/basic/object",
        },
        body: {
            name: "Body",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
})