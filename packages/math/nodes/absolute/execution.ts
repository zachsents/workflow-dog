import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"


export default createExecutionNodeDefinition(shared, {
    action: ({ number }) => ({
        absolute: Math.abs(number),
    }),
})
