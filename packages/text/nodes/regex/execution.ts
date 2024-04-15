import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: (_, { node }) => ({
        regex: {
            pattern: node.data.state?.pattern || "",
            flags: node.data.state?.flags || "",
        }
    }),
})
