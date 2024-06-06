import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"
import axios from "axios"
import { assertArgProvided } from "@pkg/lib"

export default createExecutionNodeDefinition(shared, {
    action: async ({ url, body }) => {
        assertArgProvided(url, "URL")
        const res = await axios.post(url, body)
        return {
            statusCode: res.status,
        }
    },
})
