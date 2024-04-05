import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ numbers }) => {
        const min = Math.min(...numbers)
        return { min }
    },
})