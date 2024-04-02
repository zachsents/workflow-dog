import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ dividend, divisor }) => {
        if (divisor === 0) {
            throw new Error("Divisor cannot be 0")
        }
        const quotient = dividend / divisor
        const remainder = dividend % divisor
        return { quotient, remainder }
    },
} satisfies ExecutionNodeDefinition<typeof shared>
