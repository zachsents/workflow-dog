import { createExecutionNodeDefinition } from "@pkg/types"
import axios from "axios"
import shared from "./shared"
import { catchOpenAIError } from "@pkg/openai/util"

export default createExecutionNodeDefinition(shared, {
    action: async ({ prompt }, { node, token }) => {
        if (!prompt)
            throw new Error("No prompt provided")

        /** @see https://platform.openai.com/docs/api-reference/images/create */
        const options = {
            model: node.data.state?.model || "dall-e-3",
            size: node.data.state?.size || "1024x1024",
            quality: node.data.state?.quality || "standard",
            n: 1,
            response_format: "b64_json",
        }

        const { data } = await axios.post("https://api.openai.com/v1/images/generations", {
            prompt,
            ...options,
        }, {
            headers: { Authorization: `Bearer ${token?.key}` },
        }).catch(catchOpenAIError)

        return {
            image: {
                name: "image.png",
                mimeType: "image/png",
                data: data.data[0].b64_json,
            },
            revisedPrompt: data.data[0].revised_prompt,
        }
    },
})
