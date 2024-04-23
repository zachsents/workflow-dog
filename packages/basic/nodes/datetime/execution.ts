import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"


export default createExecutionNodeDefinition(shared, {
    action: (_, { node }) => {
        return { datetime: new Date(node.data?.state?.value).toISOString() }
    },
})