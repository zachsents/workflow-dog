import { regexSchema } from "@pkg/text/schemas"
import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ text, search, replace }) => {
        if (!text)
            throw new Error("No text provided")

        return {
            replaced: search.reduce<string>((result, search, i) => {
                const replacement = replace[i] || ""

                if (typeof search === "string")
                    return result.replaceAll(search, replacement)

                if (regexSchema.safeParse(search).success)
                    return result.replaceAll(new RegExp(search.pattern, search.flags), replacement)

                return result
            }, text)
        }
    },
})
