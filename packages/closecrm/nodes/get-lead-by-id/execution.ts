import { assertArgProvided } from "@pkg/lib"
import { getClient } from "@pkg/closecrm/lib"
import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: async ({ leadId }, { token }) => {
        assertArgProvided(leadId, "lead ID")

        const client = getClient(token?.key!)
        const lead = await client.get(`/lead/${leadId}/`)
            .then(res => res.data)

        return { lead }
    },
})
