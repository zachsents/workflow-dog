import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ a, b }, { node }) => {
        return {
            result: node.data.state?.orEqual ? a >= b : a > b
        }
    },
} satisfies ExecutionNodeDefinition<typeof shared>
