import { getClient } from "@pkg/closecrm/lib"
import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"
import { assertArgProvided } from "@pkg/lib"

export default createExecutionNodeDefinition(shared, {
    action: async ({ leadId, before, after }, { token }) => {
        assertArgProvided(leadId, "lead ID")

        const client = getClient(token?.key!)

        const emails = await client.get("/activity/email/", {
            params: {
                lead_id: leadId,
                ...before && { date_created__lt: before },
                ...after && { date_created__gt: after },
            }
        })
            .then(res => res.data.data)

        return { emails }
    },
})
