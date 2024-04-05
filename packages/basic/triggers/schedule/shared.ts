import { createSharedTriggerDefinition } from "@pkg/types"


export default createSharedTriggerDefinition({
    name: "Schedule",
    whenName: "On a schedule",
    description: "Triggered on a recurring schedule.",
    inputs: {},
    outputs: {},
})