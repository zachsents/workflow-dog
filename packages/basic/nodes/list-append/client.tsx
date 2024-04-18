import { createClientNodeDefinition } from "@pkg/types"
import { TbList } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbList,
    color: "#4b5563",
    tags: ["Basic", "Lists"],
    searchTerms: ["add to"],
    inputs: {
        list: {},
        items: {
            groupName: "Items",
        },
    },
    outputs: {
        newList: {},
    },
})
