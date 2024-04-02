import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ number }) => {
        return { result: Math.log(number) }
    },
} satisfies ExecutionNodeDefinition<typeof shared>
