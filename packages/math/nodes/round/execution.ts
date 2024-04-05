import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ number }) => {
        const rounded = Math.round(number)
        return { rounded }
    },
})
