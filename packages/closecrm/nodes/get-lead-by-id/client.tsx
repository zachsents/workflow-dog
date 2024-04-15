import { createClientNodeDefinition } from "@pkg/types"
import { TbUser } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbUser,
    color: "#1463ff",
    badge: "CloseCRM",
    tags: ["CloseCRM", "CRM", "Sales"],
    inputs: {
        leadId: {},
    },
    outputs: {
        lead: {},
    },
})
