import { createExecutionNodeDefinition } from "@pkg/types"
import axios from "axios"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: async ({ leadId }, { token }) => {
        if (!leadId)
            throw new Error("No Lead ID provided")

        const { data: lead } = await axios.get(`https://api.close.com/api/v1/lead/${leadId}/`, {
            auth: {
                username: token.key,
                password: "",
            },
        })

        return { lead }
    },
})
