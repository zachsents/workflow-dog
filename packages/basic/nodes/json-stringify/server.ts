import type { ServerNodeDefinition } from "@types"
import type shared from "./shared.js"


export default {
    action: ({ object }) => {
        return {
            text: JSON.stringify(object, null, 4)
        }
    },
} satisfies ServerNodeDefinition<typeof shared>