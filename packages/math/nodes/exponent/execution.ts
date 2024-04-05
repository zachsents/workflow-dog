import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ base, exponent }) => {
        const result = Math.pow(base, exponent)
        return { result }
    },
})