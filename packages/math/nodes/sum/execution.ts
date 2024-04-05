import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ array }) => {
        const sum = array.reduce((acc, current) => acc + current, 0)
        return { sum }
    },
})
