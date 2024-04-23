import { getClient } from "@pkg/closecrm/lib"
import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: async ({ limit }, { token }) => {

        const client = getClient(token?.key!)

        const contacts = await client.get("/contact/", {
            params: limit == null ? {} : { limit }
        })
            .then(res => res.data.data)

        return { contacts }
    },
})
