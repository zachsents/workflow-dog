import { assistantMessage, systemMessage, toolMessage, userMessage } from "@pkg/openai/schemas"
import { createSharedDataTypeDefinition } from "@pkg/types"
import { z } from "zod"

export default createSharedDataTypeDefinition({
    name: "Chat History",
    description: "A chat history from ChatGPT.",
    schema: z.array(z.discriminatedUnion("role", [systemMessage, userMessage, assistantMessage, toolMessage])),
})