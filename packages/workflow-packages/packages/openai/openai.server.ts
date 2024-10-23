import { z } from "zod"
import { createPackage } from "../../registry/registry.server"
import { getThirdPartyAccountToken } from "api/lib/internal/third-party"
import axios from "axios"

const helper = createPackage("openai")

helper.thirdPartyProvider(null, {
    name: "OpenAI",
    type: "api_key",
    tokenUsage: "auth_header_bearer",
    config: {
        profileUrl: "https://api.openai.com/v1/me",
    },
})

helper.node("chatgpt", {
    name: "ChatGPT",
    async action(inputs, ctx) {
        const { account: accountId, model } = z.object({
            account: z.string().uuid(),
            model: z.enum(["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"]).default("gpt-4o"),
        }).parse(ctx.node.config)

        const { prompt, historyIn } = z.object({
            prompt: z.string(),
            historyIn: z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string(),
            }).array().default([]),
        }).parse(inputs)

        console.log(accountId)

        const { apiKey } = await getThirdPartyAccountToken(accountId)

        const historyOut = [
            ...historyIn,
            { role: "user", content: prompt },
        ]

        console.log(apiKey)

        const { data } = await axios.post("https://api.openai.com/v1/chat/completions", {
            model,
            messages: historyOut,
        }, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        })

        console.log(data)

        historyOut.push(data.choices[0].message)

        return {
            response: data.choices[0].message.content,
            historyOut,
        }
    },
})