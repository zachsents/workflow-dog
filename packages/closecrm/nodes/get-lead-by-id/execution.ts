import type { ExecutionNodeDefinition } from "@types"
import axios from "axios"
import type shared from "./shared.js"

export default {
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
} satisfies ExecutionNodeDefinition<typeof shared>
