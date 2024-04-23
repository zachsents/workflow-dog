import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "List Contacts",
    description: "List contacts from CloseCRM.",
    inputs: {
        limit: {
            name: "Limit",
            type: "https://data-types.workflow.dog/basic/number",
        }
    },
    outputs: {
        contacts: {
            name: "Contacts",
            type: "https://data-types.workflow.dog/basic/array",
        },
    },
    requiredService: {
        id: "https://services.workflow.dog/closecrm/close",
    },
})
