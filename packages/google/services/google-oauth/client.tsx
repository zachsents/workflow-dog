import type { WebServiceDefinition } from "@types"
import GoogleIcon from "../../google.svg"
import type shared from "./shared"


export default {
    icon: GoogleIcon,
    color: "#3b82f6",
    transformScope: scope => scope.match(/(?<=\/)[^/\s]+$/)?.[0] || scope,
} satisfies WebServiceDefinition<typeof shared>