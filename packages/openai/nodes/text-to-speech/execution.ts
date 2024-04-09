import { createExecutionNodeDefinition } from "@pkg/types"
import axios from "axios"
import shared from "./shared"
import { catchOpenAIError } from "@pkg/openai/util"

export default createExecutionNodeDefinition(shared, {
    action: async ({ text }, { node, token }) => {
        if (!text)
            throw new Error("No text provided")

        /** @see https://platform.openai.com/docs/api-reference/audio/createSpeech */
        const options = {
            model: node.data.state?.model || "tts-1",
            voice: node.data.state?.voice || "alloy",
            response_format: node.data.state?.format || "mp3",
            speed: node.data.state?.speed || 1,
        }

        const { data, headers } = await axios.post("https://api.openai.com/v1/audio/speech", {
            input: text,
            ...options,
        }, {
            headers: { Authorization: `Bearer ${token?.key}` },
            responseType: "arraybuffer",
        }).catch(catchOpenAIError)

        return {
            audio: {
                name: "speech.mp3",
                mimeType: headers["content-type"],
                data: Buffer.from(data, "binary").toString("base64"),
            }
        }
    },
})
