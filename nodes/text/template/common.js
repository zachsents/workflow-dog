// text/template/common.js
export default {
    name: "Fill Text Template",
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