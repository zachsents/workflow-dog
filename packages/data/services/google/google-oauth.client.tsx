import { clientService } from "@pkg/helpers/client"
import shared from "./google-oauth.shared"
import "@pkg/types/client"
import GoogleIcon from "@pkg/misc/google/google-icon.svg"
import { GoogleBlue } from "@pkg/misc/google/google-data"

export default clientService(shared, {
    icon: GoogleIcon,
    color: GoogleBlue,
    transformScope: scope => scope.match(/(?<=\/)[^/\s]+$/)?.[0] || scope,
})