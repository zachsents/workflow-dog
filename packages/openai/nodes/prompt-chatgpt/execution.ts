import type { ExecutionNodeDefinition } from "@types"
import axios from "axios"
import type shared from "./shared.js"

export default {
    action: async ({ message }, { node, token }) => {
        if (!message)
            throw new Error("No message provided")

        const { data } = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: node.data.state?.model || "gpt-4",
            messages: [{
                role: "user",
                content: message,
            }],
        }, {
            headers: { Authorization: `Bearer ${token.key}` },
        })

        return {
            response: data.choices[0].message.content,
        }
    },
} satisfies ExecutionNodeDefinition<typeof shared>
