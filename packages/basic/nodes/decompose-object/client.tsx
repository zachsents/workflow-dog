import { TbArrowsSplit } from "react-icons/tb"
import { createClientNodeDefinition } from "@pkg/types"
import shared from "./shared"


export default createClientNodeDefinition(shared, {
    icon: TbArrowsSplit,
    color: "#4b5563",
    tags: ["Basic"],
    inputs: {
        object: {
            description: "The piece of data to get properties from.",
        }
    },
    outputs: {
        properties: {
            description: "The properties from the data.",
        }
    },
})

