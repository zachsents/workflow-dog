import type { chatHistory } from "@pkg/openai/schemas"
import { catchOpenAIError } from "@pkg/openai/util"
import { createExecutionNodeDefinition } from "@pkg/types"
import axios from "axios"
import type { z } from "zod"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: async ({ prompt, categories }, { node, token }) => {
        if (!prompt)
            throw new Error("No prompt provided")

        const messages: z.infer<typeof chatHistory> = [
            {
                role: "system",
                content: `You are an advanced AI assistant. You are helping a user to classify some prompt as one of several categories. The categories are:\n\n${categories.map(c => `- ${c}`).join("\n")}\n\nRespond with the category that best fits the user's prompt. Respond using JSON format with the key "category", like this: \`{"category": "some category"}\`.`
            },
            {
                role: "user",
                content: prompt,
            },
        ]

        const { data } = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: node.data.state?.model || "gpt-3.5-turbo-0125",
            messages,
            response_format: { type: "json_object" },
        }, {
            headers: { Authorization: `Bearer ${token?.key}` },
        }).catch(catchOpenAIError)

        try {
            var parsedJson = JSON.parse(data.choices[0].message.content)
        }
        catch (err) {
            throw new Error("Model returned invalid JSON.")
        }

        return {
            category: parsedJson?.category || null,
        }
    },
})
