import { TbPlus } from "react-icons/tb"
import shared from "./shared"
import { createClientNodeDefinition } from "@pkg/types"


export default createClientNodeDefinition(shared, {
    icon: TbPlus,
    color: "#4b5563",
    tags: ["Math"],
    inputs: {
        addends: {},
    },
    outputs: {
        sum: {},
    },
})