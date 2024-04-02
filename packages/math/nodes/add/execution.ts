import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ addends }) => {
        const sum = addends.reduce((acc, current) => acc + current, 0)
        return { sum }
    },
} satisfies ExecutionNodeDefinition<typeof shared>
