import { TbSum } from "react-icons/tb"
import { createClientNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbSum,
    color: "#4b5563",
    tags: ["Math"],
    inputs: {
        array: {},
    },
    outputs: {
        sum: {},
    },
})
