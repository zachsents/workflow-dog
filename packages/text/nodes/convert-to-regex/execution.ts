import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ pattern, flags }) => ({
        regex: {
            pattern: pattern || "",
            flags: flags || "",
        },
    }),
})
