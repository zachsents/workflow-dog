import { createClientTriggerDefinition } from "@pkg/types"
import shared from "./shared"
import { TbHandClick } from "react-icons/tb"


export default createClientTriggerDefinition(shared, {
    tags: ["Basic"],
    icon: TbHandClick,
    color: "#4b5563",
    renderConfig: () => <p className="text-sm text-muted-foreground">
        This workflow is triggered when it's ran from a "Run Workflow" task in another workflow.
    </p>,
})