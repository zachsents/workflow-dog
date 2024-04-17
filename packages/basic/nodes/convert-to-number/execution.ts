import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ value }) => {
        let attempt = parseFloat(value)
        if (!isNaN(attempt))
            return { number: attempt }

        attempt = Number(value)
        if (!isNaN(attempt))
            return { number: attempt }

        return { number: null! }
    },
})
