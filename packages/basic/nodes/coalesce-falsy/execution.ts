import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ inputs }) => {
        for (const input of inputs)
            if (input) return { result: input }
        return { result: null }
    },
})
