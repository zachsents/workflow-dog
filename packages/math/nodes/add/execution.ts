import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ addends }) => {
        const sum = addends.reduce((acc, current) => acc + current, 0)
        return { sum }
    },
})
