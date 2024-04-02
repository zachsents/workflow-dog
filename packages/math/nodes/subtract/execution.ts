import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ minuend, subtrahend }) => {
        const difference = minuend - subtrahend
        return { difference }
    },
} satisfies ExecutionNodeDefinition<typeof shared>
