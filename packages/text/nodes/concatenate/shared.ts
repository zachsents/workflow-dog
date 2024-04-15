import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Join Text",
    description: "Concatenates text together.",
    inputs: {
        pieces: {
            name: "Piece",
            type: "https://data-types.workflow.dog/basic/string",
            group: true,
        },
    },
    outputs: {
        combined: {
            name: "Combined",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
})