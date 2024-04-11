import { createClientNodeDefinition } from "@pkg/types"
import { TbBrandOpenai } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbBrandOpenai,
    color: "#000000",
    tags: ["ChatGPT", "OpenAI", "AI"],
    inputs: {
        message: {},
    },
    outputs: {
        flagged: {},
        categories: {
            selectable: true,
        },
    },
})
