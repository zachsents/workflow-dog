import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Run Workflow",
    description: "Runs another workflow",
    inputs: {
        data: {
            name: "Data",
            type: "https://data-types.workflow.dog/basic/any",
        },
    },
    outputs: {
        // result: {
        //     name: "Result",
        //     type: "https://data-types.workflow.dog/basic/any",
        // },
    }
})
