import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ text }) => {
        if (!text)
            throw new Error("No text provided")

        return { length: text.length }
    },
})
