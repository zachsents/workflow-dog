import type { Insertable, Selectable, Updateable } from "kysely"
import type { Triggers } from "shared/db"
import type { MergedExport, SharedServiceDefinition, SharedTriggerDefinition } from "./shared"



/* ---------------------------------- Nodes --------------------------------- */

/* NONE NEEDED! 👊 */



/* -------------------------------- Triggers -------------------------------- */

export type ServerTriggerDefinition = {
    /** Called when this trigger is modified, created, or removed */
    onChange?: (
        oldTrigger: Selectable<Triggers> | null,
        newTrigger: Updateable<Triggers> | Insertable<Triggers> | null
    ) => Promise<void | Record<string, any>>
}

export type ServerTriggerExport = MergedExport<SharedTriggerDefinition, ServerTriggerDefinition>



/* -------------------------------- Services -------------------------------- */

export type ServerServiceDefinition<Shared extends SharedServiceDefinition> = {

} & Shared["authorizationMethod"] extends "oauth2"
    ? { oauth2Config: OAuth2Config }
    : Shared["authorizationMethod"] extends "api_key"
    ? { apiKeyConfig: KeyConfig }
    : Shared["authorizationMethod"] extends "user_pass"
    ? { userPassConfig: UserPassConfig }
    : {}

export interface OAuth2Config {
    clientId: string
    clientSecret: string
    authUrl: string
    tokenUrl: string
    scopeDelimiter: string
    additionalParams?: Record<string, string>
    allowAdditionalParams?: string[] | boolean
    state?: boolean | number | "request" | string
    scopes: string[]
    allowAdditionalScopes: boolean
    profileUrl: string
    getDisplayName: (profile: any, token: any) => string
    getServiceUserId: (profile: any, token: any) => string
    includeRedirectUriInTokenRequest: boolean
}

export interface KeyConfig {
    profileUrl: string
    getDisplayName?: (profile: any, token: any) => string
}

export interface UserPassConfig {
    profileUrl: string
    getDisplayName: (profile: any) => string
}

export type ServerServiceExport = MergedExport<SharedServiceDefinition, ServerServiceDefinition<SharedServiceDefinition>>



/* -------------------------------- Type Meta -------------------------------- */

/* NONE NEEDED! 👊 */
