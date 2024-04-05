import { createSharedServiceDefinition } from "@pkg/types"

export default createSharedServiceDefinition({
    name: "OpenAI",
    authAcquisition: {
        method: "key"
    }
})