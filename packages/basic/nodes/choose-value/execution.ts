import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ condition, ifTrue, ifFalse }) => ({
        result: condition ? ifTrue : ifFalse,
    }),
})
