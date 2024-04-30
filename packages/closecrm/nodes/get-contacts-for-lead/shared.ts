import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Get Contacts for Lead",
    description: "List contacts associated with a lead from CloseCRM.",
    inputs: {
        leadId: {
            name: "Lead ID",
            type: "https://data-types.workflow.dog/basic/string",
        }
    },
    outputs: {
        contactIds: {
            name: "Contact IDs",
            type: "https://data-types.workflow.dog/basic/array",
        },
    },
    requiredService: {
        id: "https://services.workflow.dog/closecrm/close",
    },
})
