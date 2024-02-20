export default {
    name: "Close CRM: Get Contact",
    description: "Retrieves a contact from Close CRM by its ID.",
    inputs: {
        contactId: {
            name: "Contact ID",
            type: "data-type:basic.string",
            description: "The ID of the contact to retrieve.",
        },
    },
    outputs: {
        contact: {
            name: "Contact",
            type: "data-type:basic.object",
        },
    },

    requiredIntegration: {
        service: "closeAk",
    },
}