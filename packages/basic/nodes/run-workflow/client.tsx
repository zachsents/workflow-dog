import { createClientNodeDefinition } from "@pkg/types"
import { TbRun } from "react-icons/tb"
import WorkflowSelector from "../_components/workflow-selector"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbRun,
    color: "#7c3aed",
    tags: ["Workflows", "WorkflowDog"],
    badge: "WorkflowDog",
    inputs: {
        data: {
            recommendedNode: {
                definition: "https://nodes.workflow.dog/basic/compose-object",
                handle: "object",
            }
        },
    },
    outputs: {
        // result: {},
    },
    renderBody: WorkflowSelector,
})
