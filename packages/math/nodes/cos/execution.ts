import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"

export default {
    action: ({ angle }, { node }) => {
        const convertedAngle = node.data.state?.angleMode === "degrees" ?
            angle * (Math.PI / 180) :
            angle

        return { cosine: Math.cos(convertedAngle) }
    },
} satisfies ExecutionNodeDefinition<typeof shared>