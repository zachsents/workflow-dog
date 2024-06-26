import { createClientNodeDefinition } from "@pkg/types"
import { TbLineDashed } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbLineDashed,
    color: "#4b5563",
    tags: ["Logic", "Basic"],
    inputs: {
        list: {},
        index: {
            recommendedNode: {
                definition: "https://nodes.workflow.dog/basic/number",
                handle: "number",
            }
        },
    },
    outputs: {
        item: {},
    },
})
