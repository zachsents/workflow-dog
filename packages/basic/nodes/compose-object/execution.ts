import type { ExecutionNodeDefinition } from "@types"
import type shared from "./shared.js"
import _ from "lodash"


export default {
    action: ({ properties }) => {
        return {
            object: Object.entries(properties).reduce((acc, [key, value]) => {
                if (value !== undefined)
                    _.set(acc, key, value)
                return acc
            }, {})
        }
    },
} satisfies ExecutionNodeDefinition<typeof shared>