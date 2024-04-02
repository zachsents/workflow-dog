import type { WebNodeDefinition } from "@types"
import { TbUsers } from "react-icons/tb"
import type shared from "./shared"

export default {
    icon: TbUsers,
    color: "#1463ff",
    tags: ["CloseCRM", "CRM", "Sales"],
    inputs: {
        limit: {},
    },
    outputs: {
        leads: {},
    },
} satisfies WebNodeDefinition<typeof shared>
