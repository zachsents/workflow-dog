import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: async ({ template, substitutions }) => {
        if (!template)
            throw new Error("Missing template")

        const subbedTemplate = Object.entries(substitutions).reduce((acc, [subKey, subValue]) => {
            return acc.replaceAll(`{${subKey}}`, subValue)
        }, template)

        return { result: subbedTemplate }
    },
} satisfies ExecutionNodeDefinition<typeof shared>
