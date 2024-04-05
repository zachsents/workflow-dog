import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "List Leads",
    description: "List leads from CloseCRM.",
    inputs: {
        limit: {
            name: "Limit",
            type: "https://data-types.workflow.dog/basic/number",
        }
    },
    outputs: {
        leads: {
            name: "Leads",
            type: "https://data-types.workflow.dog/basic/array",
        },
    },
    requiredService: {
        id: "https://services.workflow.dog/closecrm/close",
    },
})
