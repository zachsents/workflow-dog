import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ inputs }) => ({
        result: inputs.some(Boolean),
    }),
} satisfies ExecutionNodeDefinition<typeof shared>