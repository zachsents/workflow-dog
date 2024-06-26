import { createClientNodeDefinition } from "@pkg/types"
import { TbBrandOpenai } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbBrandOpenai,
    color: "#000000",
    badge: "OpenAI",
    tags: ["ChatGPT", "OpenAI", "AI"],
    inputs: {
        message: {
            recommendedNode: {
                definition: "https://nodes.workflow.dog/text/template",
                handle: "result",
            }
        },
        historyIn: {},
    },
    outputs: {
        response: {},
        historyOut: {},
    },
})
