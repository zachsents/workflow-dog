
import { regexSchema } from "@pkg/text/schemas"
import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ text, search }) => {
        if (text == null)
            throw new Error("No text provided")

        if (search == null)
            throw new Error("No search expression provided")

        if (typeof search === "string") return {
            count: (text.match(new RegExp(search, "g")) || []).length
        }

        if (regexSchema.safeParse(search).success) return {
            count: (text.match(new RegExp(
                search.pattern,
                search.flags.replaceAll("g", "") + "g"
            )) || []).length
        }

        return {
            count: 0
        }
    },
})
