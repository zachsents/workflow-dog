import { createClientNodeDefinition } from "@pkg/types"
import shared from "./shared"
import CloseIcon from "@pkg/closecrm/_components/close-icon"

export default createClientNodeDefinition(shared, {
    icon: CloseIcon,
    color: "#1463ff",
    badge: "CloseCRM",
    tags: ["CloseCRM", "CRM", "Sales"],
    inputs: {
        leadId: {},
        before: {},
        after: {},
    },
    outputs: {
        emails: {},
    },
})
