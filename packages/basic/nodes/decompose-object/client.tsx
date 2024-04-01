import { TbArrowsSplit } from "react-icons/tb"
import { WebNodeDefinition } from "@types"
import type shared from "./shared"


export default {
    icon: TbArrowsSplit,
    color: "#1f2937",
    tags: ["Basic"],
    inputs: {
        object: {
            description: "The piece of data to get properties from.",
        }
    },
    outputs: {
        properties: {
            description: "The properties from the data.",
        }
    },
} satisfies WebNodeDefinition<typeof shared>

