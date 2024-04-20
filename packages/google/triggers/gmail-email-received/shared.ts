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
        senderName: {
            name: "Sender Name",
            type: "https://data-types.workflow.dog/basic/string",
        },
        date: {
            name: "Date",
            type: "https://data-types.workflow.dog/basic/datetime",
        },
        subject: {
            name: "Subject",
            type: "https://data-types.workflow.dog/basic/string",
        },
        html: {
            name: "Body (HTML)",
            type: "https://data-types.workflow.dog/basic/string",
        },
        plain: {
            name: "Body (Plain Text)",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    outputs: {},
})