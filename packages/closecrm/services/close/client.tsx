import type { WebServiceDefinition } from "@types"
import CloseIcon from "../../close.svg"
import type shared from "./shared"

export default {
    icon: CloseIcon,
    color: "#1463ff",
    generateKeyUrl: "https://app.close.com/settings/developer/api-keys/",
} satisfies WebServiceDefinition<typeof shared>