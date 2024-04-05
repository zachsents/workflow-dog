import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ numbers }) => {
        const max = Math.max(...numbers)
        return { max }
    },
})
