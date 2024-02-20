export default {
    name: "Close CRM: List Contacts",
    description: "Retrieves a list of contacts from Close CRM.",
    inputs: {},
    outputs: {
        contacts: {
            name: "Contacts",
            type: "data-type:basic.array",
        },
    },

    requiredIntegration: {
        service: "closeAk",
    },
}