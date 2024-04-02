import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ input }) => {
        return {
            result: !input,
        }
    },
} satisfies ExecutionNodeDefinition<typeof shared>
