import type { ServerNodeDefinition } from "@types"
import type shared from "./shared.js"


export default {
    action: (_, { node, triggerData }) => {
        return {
            value: triggerData[node.data.state.input] ?? null
        }
    },
} satisfies ServerNodeDefinition<typeof shared>