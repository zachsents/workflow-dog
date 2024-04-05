import { createServerTriggerDefinition } from "@pkg/types"
import shared from "./shared"


export default createServerTriggerDefinition(shared, {
    onChange: async () => {
        console.log("URL trigger ready")
    },
})