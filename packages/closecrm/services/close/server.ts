import { createServerServiceDefinition } from "@pkg/types"
import shared from "./shared"

export default createServerServiceDefinition(shared, {
    authAcquisition: {
        profileUrl: "https://api.close.com/api/v1/me/",
    },
    authUsage: {
        method: "basic"
    },
})