import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"
import _ from "lodash"


export default createExecutionNodeDefinition(shared, {
    action: ({ properties }) => {
        return {
            object: Object.entries(properties).reduce((acc, [key, value]) => {
                if (value !== undefined)
                    _.set(acc, key, value)
                return acc
            }, {})
        }
    },
})