import { createExecutionNodeDefinition } from "@pkg/types"
import axios from "axios"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: async ({ limit }, { token }) => {

        const url = new URL(`https://api.close.com/api/v1/lead/`)

        if (limit != null)
            url.searchParams.append("limit", limit)

        const { data } = await axios.get(url.toString(), {
            auth: {
                username: token.key,
                password: "",
            },
        })

        return { leads: data.data }
    },
})
