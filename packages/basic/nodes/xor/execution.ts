import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ inputs }) => ({
        result: inputs.reduce((acc, current) => acc ^ current, 0),
    }),
} satisfies ExecutionNodeDefinition<typeof shared>
