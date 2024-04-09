import type { chatHistory, userMessageContentPart } from "@pkg/openai/schemas"
import { createExecutionNodeDefinition } from "@pkg/types"
import axios from "axios"
import type { z } from "zod"
import shared from "./shared"
import { catchOpenAIError } from "@pkg/openai/util"

export default createExecutionNodeDefinition(shared, {
    action: async ({ message, image, historyIn }, { node, token }) => {
        if (!image)
            throw new Error("No image provided")

        const textContentPart: z.infer<typeof userMessageContentPart>[] = message
            ? [{ type: "text", text: message }]
            : []

        const messages: z.infer<typeof chatHistory> = [
            ...(historyIn || []),
            {
                role: "user",
                content: [
                    ...textContentPart,
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${image.mimeType};base64,${image.data}`
                        },
                    },
                ],
            },
        ]

        const { data } = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: node.data.state?.model || "gpt-4-vision-preview",
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
