import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"


export default {
    action: ({ number }) => ({
        absolute: Math.abs(number),
    }),
} satisfies ExecutionNodeDefinition<typeof shared>
