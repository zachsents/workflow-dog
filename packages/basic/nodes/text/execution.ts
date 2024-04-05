import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"


export default createExecutionNodeDefinition(shared, {
    action: (_, { node }) => ({
        text: node.data?.state?.value?.toString() ?? ""
    }),
})