import { TbArrowsJoin } from "react-icons/tb"
import { WebNodeDefinition } from "@types"
import type shared from "./shared"


export default {
    icon: TbArrowsJoin,
    color: "#1f2937",
    tags: ["Basic"],
    inputs: {
        properties: {
            description: "The properties to compose into the data object.",
        }
    },
    outputs: {
        object: {
            description: "The composed object.",
        }
    },
} satisfies WebNodeDefinition<typeof shared>
