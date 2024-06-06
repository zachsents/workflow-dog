import type { ZodSchema, ZodType } from "zod"


export type MergedExport<Shared, Client> = { id: string } & Shared & Client


export type DataInterface = {
    name: string
    description?: string
    schema: ZodSchema
} & ({
    groupType: "normal" | "record"
} | {
    groupType: "list"
    defaultGroupMode: "single" | "multiple"
})


/* ---------------------------------- Nodes --------------------------------- */

export interface SharedNodeDefinition {
    name: string
    description: string
    inputs?: Record<string, DataInterface>
    outputs?: Record<string, DataInterface>

    requiredService?: {
        id: string
        scopes?: (string | string[])[]
    }
}



/* -------------------------------- Triggers -------------------------------- */

export type SharedTriggerDefinition = {
    name: string
    whenName: string
    description: string
    inputs: Record<string, DataInterface>
    outputs: Record<string, DataInterface>
}



/* -------------------------------- Services -------------------------------- */

export type ServiceAuthorizationMethod = "api_key" | "oauth2" | "user_pass"
export type ServiceAuthenticationMethod = "bearer" | "basic" | "query"

export type SharedServiceDefinition = {
    name: string
    authorizationMethod: ServiceAuthorizationMethod
    authenticationMethod: ServiceAuthenticationMethod
}



/* -------------------------------- Type Meta -------------------------------- */

export type SharedTypeMetaDefinition<Z extends ZodType = ZodType> = {
    name: string
    description?: string
    schema: Z
    compatibleWith?: string[]
}