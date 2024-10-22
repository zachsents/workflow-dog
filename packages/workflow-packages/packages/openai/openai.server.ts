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
        // getDisplayName: ({ profile }: { profile: any }) => profile.email,
    },
})

helper.node("chatgpt", {
    name: "ChatGPT",
    async action(inputs, ctx) {
        const { account: accountId, model } = z.object({
            account: z.string().uuid(),
            model: z.enum(["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"]).default("gpt-4o"),
        }).parse(ctx.node.config)

        const { prompt } = z.object({
            prompt: z.string(),
        }).parse(inputs)

        const { apiKey } = await getThirdPartyAccountToken(accountId)

        const { data } = await axios.post("https://api.openai.com/v1/chat/completions", {
            model,
            messages: [{ role: "user", content: prompt }],
        }, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        })

        return {
            response: data.choices[0].message.content,
        }
    },
})