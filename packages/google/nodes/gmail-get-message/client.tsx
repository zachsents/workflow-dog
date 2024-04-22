import { createClientNodeDefinition } from "@pkg/types"
import { TbBrandGmail } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbBrandGmail,
    color: "#ea4335",
    badge: "Gmail",
    tags: ["Gmail", "Email"],
    inputs: {
        messageId: {},
    },
    outputs: {
        senderAddress: {},
        senderName: {},
        subject: {},
        date: {},
        html: {},
        plain: {},
        attachmentRefs: {},
    },
})
