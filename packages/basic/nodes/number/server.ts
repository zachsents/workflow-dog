import type { ServerNodeDefinition } from "@types"
import type shared from "./shared.js"


export default {
    action: (_, { node }) => {
        const parsed = parseFloat(node.data?.state?.value)

        if (isNaN(parsed))
            throw new Error("Invalid number")

        return { number: parsed }
    },
} satisfies ServerNodeDefinition<typeof shared>