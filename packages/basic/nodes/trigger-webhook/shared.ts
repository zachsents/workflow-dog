import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Trigger Webhook",
    description: "Triggers a webhook URL.",
    inputs: {
        url: {
            name: "URL",
            type: "https://data-types.workflow.dog/basic/string",
        },
        body: {
            name: "Content",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    outputs: {
        statusCode: {
            name: "Status Code",
            type: "https://data-types.workflow.dog/basic/number",
        }
    },
})
