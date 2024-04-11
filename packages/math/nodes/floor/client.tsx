import { TbArrowDownCircle } from "react-icons/tb"
import { createClientNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbArrowDownCircle,
    color: "#4b5563",
    tags: ["Math"],
    inputs: {
        number: {},
    },
    outputs: {
        floored: {},
    },
})
