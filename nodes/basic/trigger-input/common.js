import { Type } from "shared/types"

export default {
    name: "Trigger Input",
    description: "Uses an input from the trigger.",
    inputs: {
        input: {
            name: "Input",
            type: Type.StringEnum(),
        }
    },
    outputs: {
        value: {
            name: "Value",
            type: Type.Any(),
        },
    },
}