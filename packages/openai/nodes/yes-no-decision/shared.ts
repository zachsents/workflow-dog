import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Yes/No Question with ChatGPT",
    description: "Uses ChatGPT to answer a yes or no question about a sample of text.",
    inputs: {
        question: {
            name: "Question",
            type: "https://data-types.workflow.dog/basic/string",
        },
        subject: {
            name: "Text",
            type: "https://data-types.workflow.dog/basic/string",
        }
    },
    outputs: {
        answer: {
            name: "Answer",
            type: "https://data-types.workflow.dog/basic/boolean",
        },
    },
    requiredService: {
        id: "https://services.workflow.dog/openai/openai",
    },
})
