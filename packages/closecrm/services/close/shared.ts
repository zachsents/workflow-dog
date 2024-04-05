import { createSharedServiceDefinition } from "@pkg/types"

export default createSharedServiceDefinition({
    name: "CloseCRM",
    authAcquisition: {
        method: "key"
    }
})