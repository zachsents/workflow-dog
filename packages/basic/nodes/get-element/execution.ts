import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ list, index }) => {
        return {
            item: list.at(index),
        }
    },
} satisfies ExecutionNodeDefinition<typeof shared>
