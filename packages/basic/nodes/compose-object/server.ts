import type { ServerNodeDefinition } from "@types"
import type shared from "./shared.js"


export default {
    action: ({ properties }) => {
        return {
            object: properties
        }
    },
} satisfies ServerNodeDefinition<typeof shared>