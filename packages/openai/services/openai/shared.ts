import type { SharedServiceDefinition } from "@types"


export default {
    name: "OpenAI",
    authAcquisition: {
        method: "key"
    }
} satisfies SharedServiceDefinition