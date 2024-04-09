import { createExecutionNodeDefinition } from "@pkg/types"
import axios from "axios"
import shared from "./shared"
import { catchOpenAIError } from "@pkg/openai/util"

export default createExecutionNodeDefinition(shared, {
    action: async ({ audio }, { node, token }) => {
        if (!audio)
            throw new Error("No audio provided")

        /** @see https://platform.openai.com/docs/api-reference/audio/createTranscription */
        const options = {
            language: node.data.state?.language || "en",
            response_format: node.data.state?.format || "text",
        }

        const formData = new FormData()
        formData.append("language", options.language)
        formData.append("response_format", options.response_format)
        formData.append("model", "whisper-1")
        formData.append(
            "file",
            new Blob([Buffer.from(audio.data, "base64")], { type: audio.mimeType }),
            audio.name,
        )

        const { data } = await axios.post("https://api.openai.com/v1/audio/transcriptions", formData, {
            headers: { Authorization: `Bearer ${token?.key}` },
        }).catch(catchOpenAIError)

        return {
            transcription: data?.trim(),
        }
    },
})
