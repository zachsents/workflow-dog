import type { ServerNodeDefinition } from "@types"
import type shared from "./shared.js"


export default {
    action: ({ inputs }) => ({
        result: inputs.every(Boolean),
    }),
} satisfies ServerNodeDefinition<typeof shared>
