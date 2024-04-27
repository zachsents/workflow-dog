import { createSharedTriggerDefinition } from "@pkg/types"


export default createSharedTriggerDefinition({
    name: "Close - New Lead in Smart View",
    whenName: "When a new lead is added to a Smart View",
    description: "Triggered when a new lead is added to a Smart View in Close CRM.",
    inputs: {
        leadId: {
            name: "Lead ID",
            type: "https://data-types.workflow.dog/basic/string",
        },
        smartViewId: {
            name: "Smart View ID",
            type: "https://data-types.workflow.dog/basic/string",
        },
    },
    outputs: {},
})