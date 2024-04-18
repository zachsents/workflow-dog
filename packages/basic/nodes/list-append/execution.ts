import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: ({ list, items }) => {
        return {
            newList: [...(list || []), ...items],
        }
    },
})