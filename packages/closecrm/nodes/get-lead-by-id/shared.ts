import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Get Lead by ID",
    description: "Retrieves a lead by its ID.",
    inputs: {
        leadId: {
            name: "Lead ID",
            type: "https://data-types.workflow.dog/basic/string",
        }
    },
    outputs: {
        lead: {
            name: "Lead",
            type: "https://data-types.workflow.dog/closecrm/lead",
        },
    },
    requiredService: {
        id: "https://services.workflow.dog/closecrm/close",
    },
})
