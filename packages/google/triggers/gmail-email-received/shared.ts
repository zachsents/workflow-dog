import { createSharedTriggerDefinition } from "@pkg/types"


export default createSharedTriggerDefinition({
    name: "Gmail - Email Received",
    whenName: "When an email is received",
    description: "Triggered when an email is received in your Gmail account.",
    inputs: {
        senderAddress: {
            name: "Sender Email Address",
            type: "https://data-types.workflow.dog/basic/string",
        },
        subject: {
            name: "Subject",
            type: "https://data-types.workflow.dog/basic/string",
        },
        html: {
            name: "Body (HTML)",
            type: "https://data-types.workflow.dog/basic/string",
        },
        plainText: {
            name: "Body (Plain Text)",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    outputs: {},
})