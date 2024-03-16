import type { SharedTriggerDefinition } from "@types"


export default {
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
} satisfies SharedTriggerDefinition