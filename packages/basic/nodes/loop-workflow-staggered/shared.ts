import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Loop Workflow (Staggered)",
    description: "Runs another workflow for every item in a list, but with a delay between each run.",
    inputs: {
        list: {
            name: "List",
            type: "https://data-types.workflow.dog/basic/array",
        },
        delay: {
            name: "Delay (seconds)",
            type: "https://data-types.workflow.dog/basic/number",
        },
    },
    outputs: {
        // result: {
        //     name: "Result",
        //     type: "https://data-types.workflow.dog/basic/any",
        // },
    }
})
