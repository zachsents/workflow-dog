import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Enroll Contact in Sequence",
    description: "Subscribes a contact to a sequence in CloseCRM.",
    inputs: {
        sequenceId: {
            name: "Sequence ID",
            type: "https://data-types.workflow.dog/basic/string",
        },
        contactId: {
            name: "Contact ID",
            type: "https://data-types.workflow.dog/basic/string",
        },
        contactEmail: {
            name: "Contact Email",
            type: "https://data-types.workflow.dog/basic/string",
        },
        senderEmail: {
            name: "Sender Email",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    outputs: {},
    requiredService: {
        id: "https://services.workflow.dog/closecrm/close",
    },
})
