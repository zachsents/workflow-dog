import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ factors }) => {
        const product = factors.reduce((acc, current) => acc * current, 1)
        return { product }
    },
} satisfies ExecutionNodeDefinition<typeof shared>
