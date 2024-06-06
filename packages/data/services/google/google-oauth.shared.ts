import { sharedService } from "@pkg/helpers/shared"

export default sharedService(import.meta.url, {
    name: "Google",
    authorizationMethod: "oauth2",
    authenticationMethod: "bearer",
})