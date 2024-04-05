import { TbCircleLetterE } from "react-icons/tb"
import { createClientNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbCircleLetterE,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {},
    outputs: {
        e: {},
    },
})
