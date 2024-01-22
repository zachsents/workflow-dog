import { Type } from "shared/types.js"


export default {
    name: "Dynamic Text",
    description: "Dynamically creates text using a template.",

    inputs: {
        template: {
            name: "Template",
            type: Type.String(),
        },
        substitution: {
            name: "Substitution",
            type: Type.String(),
            group: true,
        },
    },

    outputs: {
        text: {
            name: "Text",
            type: Type.String(),
        },
    },
}