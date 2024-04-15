import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ text, search }) => {
        if (text == null)
            throw new Error("No text provided")

        if (search == null)
            throw new Error("No search expression provided")

        return {
            contains: text.includes(search),
        }
    },
})
