import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Text Length",
    description: "Gives the length of text.",
    inputs: {
        text: {
            name: "Text",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    outputs: {
        length: {
            name: "Length",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
})