import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"


export default {
    action: ({ object }, { node }) => {
        if (!object)
            throw new Error("Didn't receive an object")

        const keys = Array.from(new Set(node.data.outputs.map(output => output.name!)))
        return {
            properties: Object.fromEntries(keys.map(key => [key, object[key]]))
        }
    },
} satisfies ExecutionNodeDefinition<typeof shared>