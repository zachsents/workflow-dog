import { createClientNodeDefinition } from "@pkg/types"
import { TbRobot } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbRobot,
    color: "#000000",
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
