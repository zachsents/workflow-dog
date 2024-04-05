import { createSharedTriggerDefinition } from "@pkg/types"


export default createSharedTriggerDefinition({
    name: "Manual",
    whenName: "When triggered manually",
    description: "Triggered manually.",
    inputs: {
        inputData: {
            name: "Input Data",
            type: "https://data-types.workflow.dog/basic/any",
        }
    },
    outputs: {
        outputData: {
            name: "Output Data",
            type: "https://data-types.workflow.dog/basic/any",
        }
    },
})