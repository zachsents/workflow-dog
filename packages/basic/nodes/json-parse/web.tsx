import { TbBraces } from "react-icons/tb"
import { WebNodeDefinition } from "@types"
import type shared from "./shared"


export default {
    icon: TbBraces,
    color: "#1f2937",
    tags: ["Basic", "JSON"],
    inputs: {
        text: {
            description: "The JSON text.",
            recommendedNode: {
                definition: "https://nodes.workflow.dog/basic/text",
                handle: "text",
            }
        }
    },
    outputs: {
        object: {
            description: "Parsed data object.",
            recommendedNode: {
                definition: "https://nodes.workflow.dog/basic/decompose-object",
                handle: "object",
            }
        }
    },
} satisfies WebNodeDefinition<typeof shared>
