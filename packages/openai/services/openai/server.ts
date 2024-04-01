import type { ServerServiceDefinition } from "@types"
import type shared from "./shared"


export default {
    authAcquisition: {
        profileUrl: "https://api.openai.com/v1/me",
    },
    authUsage: {
        method: "bearer"
    },
} satisfies ServerServiceDefinition<typeof shared>