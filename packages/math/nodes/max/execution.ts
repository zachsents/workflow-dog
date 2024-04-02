import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ numbers }) => {
        const max = Math.max(...numbers)
        return { max }
    },
} satisfies ExecutionNodeDefinition<typeof shared>
