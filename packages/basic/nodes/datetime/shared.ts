import { createSharedNodeDefinition } from "@pkg/types"

export default createSharedNodeDefinition({
    name: "Date/Time",
    description: "A simple date & time.",
    inputs: {},
    outputs: {
        datetime: {
            name: "Date/Time",
            type: "https://data-types.workflow.dog/basic/datetime",
        },
    }
})
