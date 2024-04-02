import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ a, b }) => {
        return {
            result: a == b
        }
    },
} satisfies ExecutionNodeDefinition<typeof shared>
