import { createClientNodeDefinition } from "@pkg/types"
import { TbWaveSine } from "react-icons/tb"
import AngleUnitSelector from "../_components/angle-unit-selector"
import shared from "./shared"


export default createClientNodeDefinition(shared, {
    icon: TbWaveSine,
    color: "#4b5563",
    tags: ["Math"],
    inputs: {
        angle: {},
    },
    outputs: {
        cosine: {},
    },
    renderBody: AngleUnitSelector,
})
