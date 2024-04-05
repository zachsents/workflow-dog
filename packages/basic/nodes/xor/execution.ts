import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ inputs }) => ({
        result: inputs.reduce((acc, current) => acc ^ current, 0),
    }),
})
