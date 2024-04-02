import { TbAmpersand } from "react-icons/tb"
import type { WebNodeDefinition } from "@types"
import type shared from "./shared"

export default {
    icon: TbAmpersand,
    color: "#1f2937",
    tags: ["Logic", "Basic"],
    inputs: {
        inputs: {}
    },
    outputs: {
        result: {},
    },
} satisfies WebNodeDefinition<typeof shared>
