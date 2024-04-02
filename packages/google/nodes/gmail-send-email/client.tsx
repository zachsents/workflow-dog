import type { WebNodeDefinition } from "@types"
import { TbBrandGmail } from "react-icons/tb"
import type shared from "./shared"

export default {
    icon: TbBrandGmail,
    color: "#ea4335",
    tags: ["Gmail", "Email"],
    inputs: {
        to: {},
        subject: {},
        message: {},
    },
    outputs: {},
} satisfies WebNodeDefinition<typeof shared>
