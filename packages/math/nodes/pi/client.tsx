import { createClientNodeDefinition } from "@pkg/types"
import shared from "./shared"
import { TbMathPi } from "react-icons/tb"

export default createClientNodeDefinition(shared, {
    icon: TbMathPi,
    color: "#4b5563",
    tags: ["Math"],
    inputs: {},
    outputs: {
        pi: {},
    },
})
