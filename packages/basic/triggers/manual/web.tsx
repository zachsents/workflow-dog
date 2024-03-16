import type { WebTriggerDefinition } from "@types"
import type shared from "./shared"
import { TbHandClick } from "react-icons/tb"


export default {
    tags: ["Basic"],
    icon: TbHandClick,
    color: "#1f2937",
    renderConfig: () => <p className="text-sm text-default-500">
        This workflow is triggered when it's ran from a "Run Workflow" task in another workflow.
    </p>,
} satisfies WebTriggerDefinition<typeof shared>