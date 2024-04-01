import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"


export default {
    action: ({ properties }) => {
        return {
            object: properties
        }
    },
} satisfies ExecutionNodeDefinition<typeof shared>