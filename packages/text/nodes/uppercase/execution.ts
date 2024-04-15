import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ text }) => ({
        uppercase: text.toUpperCase(),
    }),
})
