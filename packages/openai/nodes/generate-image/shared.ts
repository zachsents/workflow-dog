import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Generate Image with DALL·E",
    description: "Prompt ChatGPT with a message.",
    inputs: {
        prompt: {
            name: "Prompt",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    outputs: {
        image: {
            name: "Image",
            type: "https://data-types.workflow.dog/basic/file",
        },
    },
    requiredService: {
        id: "https://services.workflow.dog/openai/openai",
    },
})
