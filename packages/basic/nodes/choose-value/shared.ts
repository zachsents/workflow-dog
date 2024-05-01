import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Choose Value",
    description: "Chooses between 2 values based on a condition",
    inputs: {
        condition: {
            name: "Condition",
            type: "https://data-types.workflow.dog/basic/boolean",
        },
        ifTrue: {
            name: "If True",
            type: "https://data-types.workflow.dog/basic/any",
        },
        ifFalse: {
            name: "If False",
            type: "https://data-types.workflow.dog/basic/any",
        },
    },
    outputs: {
        result: {
            name: "Result",
            type: "https://data-types.workflow.dog/basic/any",
        },
    }
})
