import { Type } from "shared/types"

export default {
    name: "Decompose Object",
    description: "Decomposes an object into its properties.",
    inputs: {
        object: {
            name: "Object",
            type: Type.Object(),
        },
    },
    outputs: {
        properties: {
            name: "Properties",
            type: Type.Any(),
            group: true,
        },
    },
}