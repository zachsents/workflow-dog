import { createClientNodeDefinition } from "@pkg/types"
import { TbBracketsContain } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbBracketsContain,
    color: "#4b5563",
    tags: ["Basic", "Lists"],
    inputs: {
        items: {
            groupName: "Items",
        }
    },
    outputs: {
        list: {}
    },
})
