import { createClientNodeDefinition } from "@pkg/types"
import { TbLogicXor } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbLogicXor,
    color: "#4b5563",
    tags: ["Logic", "Basic"],
    inputs: {
        inputs: {}
    },
    outputs: {
        result: {},
    },
})
