import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ items }) => {
        return {
            list: items,
        }
    },
} satisfies ExecutionNodeDefinition<typeof shared>