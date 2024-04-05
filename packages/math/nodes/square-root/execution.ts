import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ number }) => {
        const sqrt = Math.sqrt(number)
        return { sqrt }
    },
})
