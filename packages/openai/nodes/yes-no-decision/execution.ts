import type { chatHistory } from "@pkg/openai/schemas"
import { catchOpenAIError } from "@pkg/openai/util"
import { createExecutionNodeDefinition } from "@pkg/types"
import axios from "axios"
import type { z } from "zod"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: async ({ question, subject }, { node, token }) => {
        if (!question)
            throw new Error("No question provided")

        if (!subject)
            throw new Error("No text provided")

        const messages: z.infer<typeof chatHistory> = [
            {
                role: "system",
                content: `You are an advanced AI assistant. You are helping a user to answer a yes or no question about the prompt that they submit. The question is: "${question}". Respond using a JSON object with a single key \`answer\` containing a boolean value where \`true\` means "yes" and \`false\` means "no".`
            },
            {
                role: "user",
                content: subject,
            },
        ]

        const { data } = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: node.data.state?.model || "gpt-4-turbo-preview",
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
            answer: parsedJson?.answer || null,
        }
    },
})
