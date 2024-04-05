import { createClientNodeDefinition } from "@pkg/types"
import { TbLineDashed } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbLineDashed,
    color: "#1f2937",
    tags: ["Logic", "Basic"],
    inputs: {
        list: {},
        index: {},
    },
    outputs: {
        item: {},
    },
})
