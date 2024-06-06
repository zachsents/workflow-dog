import { serverService } from "@pkg/helpers/server"
import shared from "./google-oauth.shared"
import "@pkg/types/server"


export default serverService(shared, {
    oauth2Config: {
        encryptedClientDetails: "",
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        scopeDelimiter: " ",
        additionalParams: {
            access_type: "offline",
            include_granted_scopes: "true",
        },
        allowAdditionalParams: ["login_hint"],
        state: true,
        scopes: ["email", "profile"],
        allowAdditionalScopes: true,
        profileUrl: "https://oauth2.googleapis.com/tokeninfo",
        getDisplayName: (profile) => profile.email,
        getServiceUserId: (profile) => profile.sub,
        includeRedirectUriInTokenRequest: true,
    },
})