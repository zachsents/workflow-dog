import { createServerServiceDefinition } from "@pkg/types"
import shared from "./shared"

export default createServerServiceDefinition(shared, {
    authAcquisition: {
        profileUrl: "https://api.openai.com/v1/me",
    },
    authUsage: {
        method: "bearer"
    },
})