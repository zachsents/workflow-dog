import BooleanType from "@pkg/data/type-meta/boolean.shared"
import { sharedNode } from "@pkg/helpers/shared"
import "@pkg/types/shared"

export default sharedNode(import.meta.url, {
    name: "True / False",
    description: "A fixed true or false value",
    inputs: {},
    outputs: {
        value: {
            name: "Value",
            description: "The true/false value",
            schema: BooleanType.schema,
            groupType: "normal",
        },
    },
})