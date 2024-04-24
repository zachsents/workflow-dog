import { createClientNodeDefinition } from "@pkg/types"
import { TbWebhook } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbWebhook,
    color: "#4b5563",
    tags: ["Webhook"],
    searchTerms: ["fetch", "request"],
    inputs: {
        url: {
            recommendedNode: {
                definition: "https://nodes.workflow.dog/basic/text",
                handle: "text",
            },
        },
        body: {},
    },
    outputs: {
        statusCode: {},
    },
})
