import type { OAuth2Config, ServerServiceDefinition, ServerTriggerDefinition } from "@pkg/types/server"
import _ from "lodash"
import type { sharedService, sharedTrigger } from "./shared"


export function serverTrigger<Shared extends ReturnType<typeof sharedTrigger>>(
    sharedDef: Shared,
    def: ServerTriggerDefinition,
) {
    return _.merge({}, sharedDef, def)
}

export function serverService<Shared extends ReturnType<typeof sharedService>>(
    sharedDef: Shared,
    def: ServerServiceDefinition<Shared>,
) {
    const oauth2Defaults = {
        oauth2Config: {
            scopeDelimiter: " ",
            state: false,
            scopes: [],
            allowAdditionalScopes: false,
            includeRedirectUriInTokenRequest: true,
        } satisfies Partial<OAuth2Config>
    }

    const defaults = sharedDef.authorizationMethod === "oauth2"
        ? oauth2Defaults
        : {}

    return _.merge(defaults, sharedDef, def)
}