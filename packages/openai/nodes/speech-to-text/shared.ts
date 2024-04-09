import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Transcribe Audio",
    description: "Use OpenAI's Whisper model to generate a text transcription from audio.",
    inputs: {
        audio: {
            name: "Audio",
            type: "https://data-types.workflow.dog/basic/file",
        },
    },
    outputs: {
        transcription: {
            name: "Transcription",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    requiredService: {
        id: "https://services.workflow.dog/openai/openai",
    },
})
