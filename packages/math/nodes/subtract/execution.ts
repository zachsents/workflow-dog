import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ minuend, subtrahend }) => {
        const difference = minuend - subtrahend
        return { difference }
    },
})
