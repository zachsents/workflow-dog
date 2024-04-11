import { createClientNodeDefinition } from "@pkg/types"
import { TbLogicOr } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbLogicOr,
    color: "#4b5563",
    tags: ["Logic", "Basic"],
    inputs: {
        inputs: {}
    },
    outputs: {
        result: {},
    },
})
