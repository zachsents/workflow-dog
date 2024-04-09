import { chatHistory } from "@pkg/openai/schemas"
import { createSharedDataTypeDefinition } from "@pkg/types"

export default createSharedDataTypeDefinition({
    name: "Chat History",
    description: "A chat history from ChatGPT.",
    schema: chatHistory,
})