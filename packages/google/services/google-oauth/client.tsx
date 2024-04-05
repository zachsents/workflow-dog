import { createClientServiceDefinition } from "@pkg/types"
import GoogleIcon from "../../google.svg"
import shared from "./shared"


export default createClientServiceDefinition(shared, {
    icon: GoogleIcon,
    color: "#3b82f6",
    transformScope: scope => scope.match(/(?<=\/)[^/\s]+$/)?.[0] || scope,
})