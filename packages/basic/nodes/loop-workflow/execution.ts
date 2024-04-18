import { createExecutionNodeDefinition } from "@pkg/types"
import axios from "axios"
import pLimit from "p-limit"
import shared from "./shared"


export default createExecutionNodeDefinition(shared, {
    action: async ({ list }, { node }) => {
        if (!node.data.state?.workflow)
            throw new Error("No workflow selected")

        if (!list)
            throw new Error("No list provided")

        if (!Array.isArray(list))
            throw new Error("List must be a list type")

        const runUrl = `${process.env.API_SERVER_URL}/workflows/${node.data.state.workflow}/run`

        const limit = pLimit(10)

        await Promise.all(list.map(item => limit(() => axios.post(runUrl, {
            triggerData: {
                inputData: item,
            },
        }))))

        return {
            // result: null
        }
    },
})
