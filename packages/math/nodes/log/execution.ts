import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ number, base }) => {
        const result = Math.log(number) / Math.log(base)
        return { result }
    },
} satisfies ExecutionNodeDefinition<typeof shared>
