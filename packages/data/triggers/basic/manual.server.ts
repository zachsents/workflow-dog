import { serverTrigger } from "@pkg/helpers/server"
import shared from "./manual.shared"
import "@pkg/types/shared"
import "@pkg/types/server"

export default serverTrigger(shared, {
    async onChange() {
        console.log("Changed manual trigger. Nothing happens here.")
    }
})