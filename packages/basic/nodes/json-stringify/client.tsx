import { TbBraces } from "react-icons/tb"
import { createClientNodeDefinition } from "@pkg/types"
import shared from "./shared"


export default createClientNodeDefinition(shared, {
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
})

