import type { chatHistory } from "@pkg/openai/schemas"
import { catchOpenAIError } from "@pkg/openai/util"
import { createExecutionNodeDefinition } from "@pkg/types"
import axios from "axios"
import type { z } from "zod"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: async ({ text, targets }, { node, token }) => {
        if (!text)
            throw new Error("No text provided")

        if (targets.length == 0)
            throw new Error("No information to search for")

        const targetKeys = targets.map(c => c.toLowerCase().slice(0, 40).trim().replaceAll(/\W+/g, "_"))
        const targetList = targets.map((c, i) => `- [${targetKeys[i]}]: ${c}`)

        const messages: z.infer<typeof chatHistory> = [
            {
                role: "system",
                content: `You are an advanced AI assistant. You are helping a user to extract certain pieces of information from some prompt. The user is requesting the following information:\n\n${targetList.join("\n")}\n\nRespond using a JSON object with keys as provided. If you cannot find a certain piece of information, respond with \`null\`. Prefer a single value for each piece of requested information, but if it seems appropriate, you can respond with an array of values or even a nested object.`
            },
            {
                role: "user",
                content: text,
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
            extracted: targetKeys.map(key => parsedJson[key] ?? null),
        }
    },
})
