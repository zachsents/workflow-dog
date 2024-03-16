import type { SharedServiceDefinition } from "@types"


export default {
    name: "Google",
    authAcquisition: {
        method: "oauth2"
    }
} satisfies SharedServiceDefinition