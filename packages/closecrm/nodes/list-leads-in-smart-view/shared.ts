import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "List Leads in Smart View",
    description: "List leads from a Smart View in CloseCRM.",
    inputs: {
        smartViewId: {
            name: "Smart View ID",
            type: "https://data-types.workflow.dog/basic/string",
        }
    },
    outputs: {
        leadIds: {
            name: "Lead IDs",
            type: "https://data-types.workflow.dog/basic/array",
        },
    },
    requiredService: {
        id: "https://services.workflow.dog/closecrm/close",
    },
})
