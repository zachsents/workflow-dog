import { createClientNodeDefinition } from "@pkg/types"
import { TbExclamationMark } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbExclamationMark,
    color: "#4b5563",
    tags: ["Logic", "Basic"],
    inputs: {
        input: {},
    },
    outputs: {
        result: {},
    },
})
