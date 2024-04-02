import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ number }) => {
        const rounded = Math.round(number)
        return { rounded }
    },
} satisfies ExecutionNodeDefinition<typeof shared>
