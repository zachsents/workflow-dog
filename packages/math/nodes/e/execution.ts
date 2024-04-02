import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"


export default {
    action: () => {
        return { e: Math.E }
    },
} satisfies ExecutionNodeDefinition<typeof shared>
