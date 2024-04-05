import { createClientNodeDefinition } from "@pkg/types"
import { TbUsers } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbUsers,
    color: "#1463ff",
    tags: ["CloseCRM", "CRM", "Sales"],
    inputs: {
        limit: {},
    },
    outputs: {
        leads: {},
    },
})
