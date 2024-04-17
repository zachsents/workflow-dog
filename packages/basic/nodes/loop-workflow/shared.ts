import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Loop Workflow",
    description: "Runs another workflow for every item in a list.",
    inputs: {
        list: {
            name: "List",
            type: "https://data-types.workflow.dog/basic/array",
        },
    },
    outputs: {
        // result: {
        //     name: "Result",
        //     type: "https://data-types.workflow.dog/basic/any",
        // },
    }
})
