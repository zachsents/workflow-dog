import { createClientNodeDefinition } from "@pkg/types"
import { TbLogicXor } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbLogicXor,
    color: "#1f2937",
    tags: ["Logic", "Basic"],
    inputs: {
        inputs: {}
    },
    outputs: {
        result: {},
    },
})
