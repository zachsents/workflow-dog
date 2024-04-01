import type { ServerTriggerDefinition } from "@types"
import type shared from "./shared.js"


export default {
    onChange: async () => {
        console.log("URL trigger ready")
    },
} satisfies ServerTriggerDefinition<typeof shared>