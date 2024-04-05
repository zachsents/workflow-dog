import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ a, b }, { node }) => {
        return {
            result: node.data.state?.orEqual ? a >= b : a > b
        }
    },
})
