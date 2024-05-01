import { createClientNodeDefinition } from "@pkg/types"
import { TbSwitch } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbSwitch,
    color: "#4b5563",
    tags: ["Logic", "Basic", "Control"],
    searchTerms: ["ternary"],
    inputs: {
        condition: {},
        ifTrue: {},
        ifFalse: {},
    },
    outputs: {
        result: {},
    },
})
