import { TbArrowUpCircle } from "react-icons/tb"
import { createClientNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbArrowUpCircle,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        number: {}
    },
    outputs: {
        ceiled: {},
    },
})
