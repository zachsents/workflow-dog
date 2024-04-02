import type { ExecutionNodeDefinition } from "@types"
import axios from "axios"
import type shared from "./shared.js"

export default {
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
} satisfies ExecutionNodeDefinition<typeof shared>
