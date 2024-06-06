import { serverTrigger } from "@pkg/helpers/server"
import "@pkg/types/server"
import "@pkg/types/shared"
import shared from "./request.shared"

export default serverTrigger(shared, {
    async onChange() {
        console.log("URL Request Trigger ready")
    }
})