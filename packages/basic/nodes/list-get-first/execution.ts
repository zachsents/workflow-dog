import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"
import { assertArgProvided } from "@pkg/lib"

export default createExecutionNodeDefinition(shared, {
    action: ({ list }) => {
        assertArgProvided(list, "list")
        return {
            item: list[0],
        }
    },
})