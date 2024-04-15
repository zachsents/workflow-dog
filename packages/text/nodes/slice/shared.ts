import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Slice Text",
    description: "Takes a slice of text.",
    inputs: {
        text: {
            name: "Text",
            type: "https://data-types.workflow.dog/basic/string",
        },
        start: {
            name: "Start",
            type: "https://data-types.workflow.dog/basic/number",
        },
        end: {
            name: "End",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
    outputs: {
        slice: {
            name: "Slice",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
})