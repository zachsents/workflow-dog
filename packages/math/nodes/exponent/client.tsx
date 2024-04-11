import { createClientNodeDefinition } from "@pkg/types"
import { TbSuperscript } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbSuperscript,
    color: "#4b5563",
    tags: ["Math"],
    inputs: {
        base: {},
        exponent: {},
    },
    outputs: {
        result: {},
    },
})
