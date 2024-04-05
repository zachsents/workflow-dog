import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ a, b }) => {
        return {
            result: a == b
        }
    },
})
