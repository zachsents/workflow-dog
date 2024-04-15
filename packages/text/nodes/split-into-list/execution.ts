import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"
import { regexSchema } from "@pkg/text/schemas"

export default createExecutionNodeDefinition(shared, {
    action: ({ text, delimiter }) => {
        if (!text)
            throw new Error("No text provided")

        if (typeof delimiter === "string") return {
            parts: text.split(delimiter)
        }

        if (regexSchema.safeParse(delimiter).success) return {
            parts: text.split(new RegExp(delimiter.pattern, delimiter.flags))
        }

        return {
            parts: [text]
        }
    },
})
