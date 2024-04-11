import { createClientNodeDefinition } from "@pkg/types"
import { TbEqualNot } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbEqualNot,
    color: "#4b5563",
    tags: ["Logic", "Basic"],
    inputs: {
        a: {},
        b: {},
    },
    outputs: {
        result: {},
    },
})
