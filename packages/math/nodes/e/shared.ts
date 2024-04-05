import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "E (e)",
    description: "Outputs the mathematical constant e.",
    inputs: {},
    outputs: {
        e: {
            name: "e",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
})
