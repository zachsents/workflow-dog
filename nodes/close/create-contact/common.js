export default {
    name: "Close CRM: Create Contact",
    description: "Create a new contact in Close CRM.",
    inputs: {
        name: {
            name: "Name",
            type: "data-type:basic.string",
        },
        title: {
            name: "Title",
            type: "data-type:basic.string",
        },
        phones: {
            name: "Phone Numbers",
            type: "data-type:basic.string",
            group: true,
            named: true,
        },
        emails: {
            name: "Emails",
            type: "data-type:basic.string",
            group: true,
            named: true,
        },
    },
    outputs: {
        contact: {
            name: "Created Contact",
            type: "data-type:basic.object",
        },
    },

    requiredIntegration: {
        service: "closeAk",
    },
}