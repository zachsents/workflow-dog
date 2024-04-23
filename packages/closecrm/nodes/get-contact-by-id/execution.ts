import { assertArgProvided } from "@pkg/_lib"
import { getClient } from "@pkg/closecrm/lib"
import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: async ({ contactId }, { token }) => {
        assertArgProvided(contactId, "contact ID")

        const client = getClient(token?.key!)
        const contact = await client.get(`/contact/${contactId}/`)
            .then(res => res.data)

        return { contact }
    },
})
