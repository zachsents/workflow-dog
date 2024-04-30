import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"
import _ from "lodash"


export default createExecutionNodeDefinition(shared, {
    action: ({ object }, { node }) => {
        if (!object)
            throw new Error("Didn't receive an object")

        const keys = Array.from(
            new Set(node.data.outputs.map(output => output.name!))
        )

        return {
            properties: Object.fromEntries(keys.map(key => [key, _.get(object, key) ?? null]))
        }
    },
})