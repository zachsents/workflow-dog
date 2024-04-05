import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"


export default createExecutionNodeDefinition(shared, {
    action: ({ text }) => {
        try {
            return {
                object: JSON.parse(text)
            }
        }
        catch (err) {
            // console.debug(err)
            throw new Error("Invalid JSON text.")
        }
    },
})