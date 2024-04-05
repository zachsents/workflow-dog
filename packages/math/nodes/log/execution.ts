import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ number, base }) => {
        const result = Math.log(number) / Math.log(base)
        return { result }
    },
})
