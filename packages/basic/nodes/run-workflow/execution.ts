import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"
import axios from "axios"

export default createExecutionNodeDefinition(shared, {
    action: async ({ data }, { node }) => {

        if (!node.data.state?.workflow)
            throw new Error("No workflow selected")

        const runUrl = `${process.env.API_SERVER_URL}/workflows/${node.data.state.workflow}/run`
        await axios.post(runUrl, {
            triggerData: {
                inputData: data,
            },
        })

        return {
            // result: null
        }
    },
})
