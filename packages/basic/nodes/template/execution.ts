import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: async ({ template, substitutions }) => {
        if (!template)
            throw new Error("Missing template")

        const subbedTemplate = Object.entries(substitutions).reduce((acc, [subKey, subValue]) => {
            return acc.replaceAll(`{${subKey}}`, subValue)
        }, template)

        return { result: subbedTemplate }
    },
})
