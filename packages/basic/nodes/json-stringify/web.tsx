import { TbBraces } from "react-icons/tb"
import { WebNodeDefinition } from "@types"
import type shared from "./shared"


export default {
    icon: TbBraces,
    color: "#1f2937",
    tags: ["Basic", "JSON"],
    inputs: {
        object: {
            description: "The data object to convert.",
        }
    },
    outputs: {
        text: {
            description: "The JSON text.",
        }
    },
} satisfies WebNodeDefinition<typeof shared>

