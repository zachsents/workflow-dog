import { TbArrowsJoin } from "react-icons/tb"
import { createClientNodeDefinition } from "@pkg/types"
import shared from "./shared"


export default createClientNodeDefinition(shared, {
    icon: TbArrowsJoin,
    color: "#4b5563",
    tags: ["Basic"],
    inputs: {
        properties: {
            description: "The properties to compose into the data object.",
        }
    },
    outputs: {
        object: {
            description: "The composed object.",
        }
    },
})
