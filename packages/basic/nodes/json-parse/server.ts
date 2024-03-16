import type { ServerNodeDefinition } from "@types"
import type shared from "./shared.js"


export default {
    action: ({ text }) => {
        try {
            return {
                object: JSON.parse(text)
            }
        }
        catch (err) {
            // console.debug(err)
            throw new Error("Invalid JSON text.")
        }
    },
} satisfies ServerNodeDefinition<typeof shared>