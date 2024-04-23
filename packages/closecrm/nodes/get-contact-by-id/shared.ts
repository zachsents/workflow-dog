import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Get Contact by ID",
    description: "Retrieves a contact by its ID.",
    inputs: {
        contactId: {
            name: "Contact ID",
            type: "https://data-types.workflow.dog/basic/string",
        }
    },
    outputs: {
        contact: {
            name: "Contact",
            type: "https://data-types.workflow.dog/basic/object",
        },
    },
    requiredService: {
        id: "https://services.workflow.dog/closecrm/close",
    },
})
