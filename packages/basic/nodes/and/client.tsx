import { TbAmpersand } from "react-icons/tb"
import { createClientNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbAmpersand,
    color: "#4b5563",
    tags: ["Logic", "Basic"],
    inputs: {
        inputs: {}
    },
    outputs: {
        result: {},
    },
})
