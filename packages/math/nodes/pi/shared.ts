import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Pi (π)",
    description: "Outputs the mathematical constant PI.",
    inputs: {},
    outputs: {
        pi: {
            name: "π",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
})
