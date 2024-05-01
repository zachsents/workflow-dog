import { assertArgProvided } from "@pkg/_lib"
import { createExecutionNodeDefinition } from "@pkg/types"
import axios from "axios"
import pLimit from "p-limit"
import shared from "./shared"


export default createExecutionNodeDefinition(shared, {
    action: async ({ list, delay }, { node }) => {
        assertArgProvided(node.data.state?.workflow, "workflow")
        assertArgProvided(list, "list")

        if (!Array.isArray(list))
            throw new Error("List must be a list type")

        const runUrl = `${process.env.API_SERVER_URL}/workflows/${node.data.state.workflow}/run`

        const limit = pLimit(10)
        const now = new Date().getTime()

        await Promise.all(list.map((item, i) => limit(() => axios.post(runUrl, {
            triggerData: {
                inputData: item,
            },
            scheduledFor: new Date(now + (i + 1) * delay * 1000).toISOString(),
        }))))

        return {}
    },
})
