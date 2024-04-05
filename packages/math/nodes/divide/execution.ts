import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ dividend, divisor }) => {
        if (divisor === 0) {
            throw new Error("Divisor cannot be 0")
        }
        const quotient = dividend / divisor
        const remainder = dividend % divisor
        return { quotient, remainder }
    },
})
