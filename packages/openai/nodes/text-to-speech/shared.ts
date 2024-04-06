import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Text-to-Speech",
    description: "Use OpenAI's Text-to-Speech to generate an audio file from text.",
    inputs: {
        text: {
            name: "Text",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    outputs: {
        audio: {
            name: "Audio",
            type: "https://data-types.workflow.dog/basic/file",
        },
    },
    requiredService: {
        id: "https://services.workflow.dog/openai/openai",
    },
})
