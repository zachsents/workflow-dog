import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ list, index }) => {
        return {
            item: list.at(index),
        }
    },
})
