import { createClientNodeDefinition } from "@pkg/types"
import { TbRobot } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbRobot,
    color: "#000000",
    tags: ["ChatGPT", "OpenAI", "AI", "Vision"],
    inputs: {
        message: {
            recommendedNode: {
                definition: "https://nodes.workflow.dog/basic/template",
                handle: "result",
            }
        },
        image: {},
        historyIn: {},
    },
    outputs: {
        response: {},
        historyOut: {},
    },
})
