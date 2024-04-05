import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ number }) => {
        const floored = Math.floor(number)
        return { floored }
    },
})