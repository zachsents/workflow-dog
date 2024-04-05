import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"


export default createExecutionNodeDefinition(shared, {
    action: (_, { node }) => ({
        enabled: node.data?.state?.value ?? false
    }),
})