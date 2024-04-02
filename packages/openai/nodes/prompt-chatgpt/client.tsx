import type { WebNodeDefinition } from "@types"
import { TbRobot } from "react-icons/tb"
import type shared from "./shared"

export default {
    icon: TbRobot,
    color: "#000000",
    tags: ["ChatGPT", "OpenAI", "AI"],
    inputs: {
        message: {},
    },
    outputs: {
        response: {},
    },
} satisfies WebNodeDefinition<typeof shared>
