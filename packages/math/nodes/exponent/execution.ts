import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ base, exponent }) => {
        const result = Math.pow(base, exponent)
        return { result }
    },
} satisfies ExecutionNodeDefinition<typeof shared>