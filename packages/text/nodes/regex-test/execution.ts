import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"
import { regexSchema } from "@pkg/text/schemas"

export default createExecutionNodeDefinition(shared, {
    action: ({ text, regex }) => {
        if (text == null)
            throw new Error("No text provided")

        if (regex == null)
            throw new Error("No search expression provided")

        if (!regexSchema.safeParse(regex).success)
            throw new Error("Invalid regex provided")

        return {
            result: new RegExp(regex.pattern, regex.flags).test(text)
        }
    },
})
