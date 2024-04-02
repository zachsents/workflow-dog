import type { WebNodeDefinition } from "@types"
import { TbUser } from "react-icons/tb"
import type shared from "./shared"

export default {
    icon: TbUser,
    color: "#1463ff",
    tags: ["CloseCRM", "CRM", "Sales"],
    inputs: {
        leadId: {},
    },
    outputs: {
        lead: {},
    },
} satisfies WebNodeDefinition<typeof shared>
