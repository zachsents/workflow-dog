import { createExecutionNodeDefinition } from "@pkg/types"
import axios from "axios"
import shared from "./shared"
import { catchOpenAIError } from "@pkg/openai/util"

export default createExecutionNodeDefinition(shared, {
    action: async ({ message }, { token }) => {
        if (!message)
            throw new Error("No message provided")

        const { data } = await axios.post("https://api.openai.com/v1/moderations", {
            input: message,
        }, {
            headers: { Authorization: `Bearer ${token?.key}` },
        }).catch(catchOpenAIError)

        return {
            flagged: data.results[0].flagged,
            categories: data.results[0].categories,
        }
    },
})
