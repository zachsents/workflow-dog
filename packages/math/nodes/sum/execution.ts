import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ array }) => {
        const sum = array.reduce((acc, current) => acc + current, 0)
        return { sum }
    },
} satisfies ExecutionNodeDefinition<typeof shared>
