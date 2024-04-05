import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ factors }) => {
        const product = factors.reduce((acc, current) => acc * current, 1)
        return { product }
    },
})
