import { getClient, querySmartView } from "@pkg/closecrm/lib"
import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"
import { assertArgProvided } from "@pkg/lib"

export default createExecutionNodeDefinition(shared, {
    action: async ({ smartViewId }, { token }) => {
        assertArgProvided(smartViewId, "Smart View ID")

        const client = getClient(token?.key!)
        const leadIds = await querySmartView(client, smartViewId)

        return { leadIds }
    },
})
