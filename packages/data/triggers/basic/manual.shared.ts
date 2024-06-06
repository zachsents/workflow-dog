import AnyType from "@pkg/data/type-meta/any.shared"
import { sharedTrigger } from "@pkg/helpers/shared"
import "@pkg/types/shared"

export default sharedTrigger(import.meta.url, {
    name: "Manual",
    whenName: "When triggered manually",
    description: "Triggered manually.",
    inputs: {
        inputData: {
            name: "Input Data",
            description: "The input data",
            schema: AnyType.schema,
            groupType: "normal",
        },
    },
    outputs: {
        outputData: {
            name: "Output Data",
            description: "The output data",
            schema: AnyType.schema,
            groupType: "normal",
        },
    },
})