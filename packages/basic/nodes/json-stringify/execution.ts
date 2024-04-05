import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"


export default createExecutionNodeDefinition(shared, {
    action: ({ object }) => {
        return {
            text: JSON.stringify(object, null, 4)
        }
    },
})