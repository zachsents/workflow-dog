import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ number }) => {
        const ceiled = Math.ceil(number)
        return { ceiled }
    },
} satisfies ExecutionNodeDefinition<typeof shared>
