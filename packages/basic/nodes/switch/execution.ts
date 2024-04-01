import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"


export default {
    action: (_, { node }) => ({
        enabled: node.data?.state?.value ?? false
    }),
} satisfies ExecutionNodeDefinition<typeof shared>