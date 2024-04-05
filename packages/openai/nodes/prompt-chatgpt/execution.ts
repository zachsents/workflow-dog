import { createExecutionNodeDefinition } from "@pkg/types"
import axios from "axios"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: async ({ message, historyIn }, { node, token }) => {
        if (!message)
            throw new Error("No message provided")

        const messages = [
            ...(historyIn || []),
            {
                role: "user",
                content: message,
            },
        ]

        const { data } = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: node.data.state?.model || "gpt-4",
            messages,
        }, {
            headers: { Authorization: `Bearer ${token?.key}` },
        })

        return {
            response: data.choices[0].message.content,
            historyOut: [
                ...messages,
                data.choices[0].message,
            ],
        }
    },
})
