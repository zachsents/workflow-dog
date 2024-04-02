import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ number }) => {
        const sqrt = Math.sqrt(number)
        return { sqrt }
    },
} satisfies ExecutionNodeDefinition<typeof shared>
