import { createClientNodeDefinition } from "@pkg/types"
import { TbBrandOpenai } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbBrandOpenai,
    color: "#000000",
    badge: "OpenAI",
    tags: ["ChatGPT", "OpenAI", "AI", "DALL-E"],
    inputs: {
        prompt: {
            recommendedNode: {
                definition: "https://nodes.workflow.dog/basic/text",
                handle: "text",
            }
        },
    },
    outputs: {
        image: {},
        revisedPrompt: {},
    },
})
