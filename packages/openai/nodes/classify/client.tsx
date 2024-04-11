import { createClientNodeDefinition } from "@pkg/types"
import { TbBrandOpenai } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbBrandOpenai,
    color: "#000000",
    tags: ["ChatGPT", "OpenAI", "AI"],
    inputs: {
        prompt: {
            recommendedNode: {
                definition: "https://nodes.workflow.dog/basic/template",
                handle: "result",
            }
        },
        categories: {
            groupName: "Categories",
            recommendedNode: {
                definition: "https://nodes.workflow.dog/basic/text",
                handle: "text",
            }
        },
    },
    outputs: {
        category: {}
    },
})
