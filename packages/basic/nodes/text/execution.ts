import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"


export default {
    action: (_, { node }) => ({
        text: node.data?.state?.value?.toString() ?? ""
    }),
} satisfies ExecutionNodeDefinition<typeof shared>