import { Type } from "shared/types"

export default {
    name: "Manual",
    whenName: "When triggered manually",
    description: "Triggered manually.",
    inputs: {
        inputData: {
            name: "Input Data",
            type: Type.Any(),
        }
    },
    outputs: {
        outputData: {
            name: "Output Data",
            type: Type.Any(),
        }
    },
}