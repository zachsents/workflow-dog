import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"


export default createExecutionNodeDefinition(shared, {
    action: (_, { node, triggerData }) => {
        return {
            value: triggerData[node.data.state.input] ?? null
        }
    },
})