import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ numbers }) => {
        const min = Math.min(...numbers)
        return { min }
    },
} satisfies ExecutionNodeDefinition<typeof shared>