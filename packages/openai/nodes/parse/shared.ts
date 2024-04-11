import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Extract with ChatGPT",
    description: "Uses ChatGPT to extract the specified information from the prompt.",
    inputs: {
        text: {
            name: "Text",
            type: "https://data-types.workflow.dog/basic/string",
        },
        targets: {
            name: "Target",
            type: "https://data-types.workflow.dog/basic/string",
            group: true,
            named: false,
        },
    },
    outputs: {
        extracted: {
            name: "Extracted",
            type: "https://data-types.workflow.dog/basic/string",
            group: true,
            named: false,
        },
    },
    requiredService: {
        id: "https://services.workflow.dog/openai/openai",
    },
})
