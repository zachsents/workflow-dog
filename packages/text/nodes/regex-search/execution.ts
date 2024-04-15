import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ text, search }) => {
        if (!text)
            throw new Error("No text provided")

        if (!search)
            throw new Error("No search expression provided")

        const regexMatch = text.match(new RegExp(
            search.pattern,
            search.flags.replaceAll("g", "")
        )) || []

        return {
            match: regexMatch[0]!,
            matchedGroups: regexMatch.slice(1),
        }
    },
})
