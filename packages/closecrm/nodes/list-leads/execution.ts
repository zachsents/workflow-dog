import { getClient } from "@pkg/closecrm/lib"
import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: async ({ limit }, { token }) => {

        const client = getClient(token?.key!)

        const leads = await client.get("/lead/", {
            params: limit == null ? {} : { limit }
        })
            .then(res => res.data.data)

        return { leads }
    },
})
