

export default {
    name: "Dynamic Text",
    description: "Dynamically creates text using a template.",

    inputs: {
        template: {
            name: "Template",
            type: "data-type:basic.string",
        },
        substitution: {
            name: "Substitution",
            type: "data-type:basic.string",
            group: true,
            named: true,
        },
    },

    outputs: {
        text: {
            name: "Text",
            type: "data-type:basic.string",
        },
    },
}