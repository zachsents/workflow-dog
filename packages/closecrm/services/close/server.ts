import type { ServerServiceDefinition } from "@types"
import type shared from "./shared"

export default {
    authAcquisition: {
        profileUrl: "https://api.close.com/api/v1/me/",
    },
    authUsage: {
        method: "basic"
    },
} satisfies ServerServiceDefinition<typeof shared>