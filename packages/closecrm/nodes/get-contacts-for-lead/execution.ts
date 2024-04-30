import { getClient } from "@pkg/closecrm/lib"
import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: async ({ leadId }, { token }) => {

        const client = getClient(token?.key!)

        const contactIds = await client.post("/data/search/", {
            query: {
                type: "and",
                queries: [
                    {
                        type: "object_type",
                        object_type: "contact"
                    },
                    {
                        type: "field_condition",
                        field: {
                            type: "regular_field",
                            object_type: "contact",
                            field_name: "lead_id"
                        },
                        condition: {
                            type: "text",
                            mode: "full_words",
                            value: leadId,
                        }
                    }
                ]
            },
            _fields: {
                contact: ["id"]
            },
        }).then(res => res.data.data.map((c: any) => c.id))

        return { contactIds }
    },
})
