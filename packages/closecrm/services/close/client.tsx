import { createClientServiceDefinition } from "@pkg/types"
import CloseIcon from "../../close.svg"
import shared from "./shared"

export default createClientServiceDefinition(shared, {
    icon: CloseIcon,
    color: "#1463ff",
    generateKeyUrl: "https://app.close.com/settings/developer/api-keys/",
})