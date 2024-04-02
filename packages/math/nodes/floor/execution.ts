import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ number }) => {
        const floored = Math.floor(number)
        return { floored }
    },
} satisfies ExecutionNodeDefinition<typeof shared>