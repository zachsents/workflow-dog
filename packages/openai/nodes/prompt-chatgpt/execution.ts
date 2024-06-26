import type { chatHistory } from "@pkg/openai/schemas"
import { createExecutionNodeDefinition } from "@pkg/types"
import axios from "axios"
import type { z } from "zod"
import shared from "./shared"
import { catchOpenAIError } from "@pkg/openai/util"

export default createExecutionNodeDefinition(shared, {
    action: async ({ message, historyIn }, { node, token }) => {
        if (!message)
            throw new Error("No message provided")

        const messages: z.infer<typeof chatHistory> = [
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
        }).catch(catchOpenAIError)

        return {
            response: data.choices[0].message.content,
            historyOut: [
                ...messages,
                data.choices[0].message,
            ],
        }
    },
})
