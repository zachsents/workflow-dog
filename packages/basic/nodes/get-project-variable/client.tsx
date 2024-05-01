import { createClientNodeDefinition } from "@pkg/types"
import { TbVariable } from "react-icons/tb"
import VariableNameInput from "../_components/variable-name-input"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbVariable,
    color: "#7c3aed",
    tags: ["WorkflowDog", "Variables"],
    inputs: {
    },
    outputs: {
        value: {},
    },
    renderBody: VariableNameInput,
})
