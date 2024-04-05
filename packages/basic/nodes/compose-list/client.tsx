import { createClientNodeDefinition } from "@pkg/types"
import { TbBracketsContain } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbBracketsContain,
    color: "#1f2937",
    tags: ["Basic"],
    inputs: {
        items: {}
    },
    outputs: {
        list: {}
    },
})
