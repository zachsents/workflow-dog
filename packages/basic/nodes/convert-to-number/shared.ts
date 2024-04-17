import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Convert to Number",
    description: "Converts a value to a number.",
    inputs: {
        value: {
            name: "Value",
            type: "https://data-types.workflow.dog/basic/any",
        },
    },
    outputs: {
        number: {
            name: "Number",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
})