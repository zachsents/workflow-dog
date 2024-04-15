import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ text, start, end }) => ({
        slice: text.slice(start, end),
    }),
})
