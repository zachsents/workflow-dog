import { createSharedServiceDefinition } from "@pkg/types"


export default createSharedServiceDefinition({
    name: "Google",
    authAcquisition: {
        method: "oauth2"
    }
})