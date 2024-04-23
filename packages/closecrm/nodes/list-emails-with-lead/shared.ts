import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "List Emails w/ Lead",
    description: "List all email messages with a lead from CloseCRM.",
    inputs: {
        leadId: {
            name: "Lead ID",
            type: "https://data-types.workflow.dog/basic/string",
        },
        before: {
            name: "Before",
            type: "https://data-types.workflow.dog/basic/datetime",
        },
        after: {
            name: "After",
            type: "https://data-types.workflow.dog/basic/datetime",
        },
    },
    outputs: {
        emails: {
            name: "Emails",
            type: "https://data-types.workflow.dog/basic/array",
        },
    },
    requiredService: {
        id: "https://services.workflow.dog/closecrm/close",
    },
})
