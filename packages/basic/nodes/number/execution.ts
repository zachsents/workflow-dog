import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"


export default createExecutionNodeDefinition(shared, {
    action: (_, { node }) => {
        const parsed = parseFloat(node.data?.state?.value)

        if (isNaN(parsed))
            throw new Error("Invalid number")

        return { number: parsed }
    },
})