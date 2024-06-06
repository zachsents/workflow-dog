import BooleanType from "@pkg/data/type-meta/boolean.shared"
import { sharedNode } from "@pkg/helpers/shared"
import "@pkg/types/shared"
import { z } from "zod"

export default sharedNode(import.meta.url, {
    name: "And",
    description: "Logical AND operator",
    inputs: {
        inputs: {
            name: "Inputs",
            description: "The inputs to AND together",
            schema: BooleanType.schema,
            groupType: "list",
            defaultGroupMode: "multiple",
        },
    },
    outputs: {
        result: {
            name: "Result",
            description: "The result of the AND operation",
            schema: BooleanType.schema,
            groupType: "normal",
        },
    }
})
