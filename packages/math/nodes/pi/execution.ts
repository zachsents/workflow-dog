import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: () => {
        return { pi: Math.PI }
    },
} satisfies ExecutionNodeDefinition<typeof shared>
