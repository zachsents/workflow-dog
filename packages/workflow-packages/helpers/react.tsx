import { StandardNode } from "web/src/components/action-node"


/* ------------------------------------------------------ */
/* Types                                                  */
/* ------------------------------------------------------ */
// #region Types

import { IconSquare } from "@tabler/icons-react"

export interface ClientNodeDefinition {
    name: string
    icon: React.ComponentType
    /**
     * If this starts with a #, it will be treated as a hex code. Otherwise, 
     * it will be treated as a Tailwind class.
     */
    color: string
    component: React.ComponentType
}


/* ------------------------------------------------------ */
/* Helpers                                                */
/* ------------------------------------------------------ */
// #region Helpers

export function createClientNodeDef(opts: Partial<ClientNodeDefinition>): ClientNodeDefinition {
    return {
        name: "Unknown Node",
        icon: IconSquare,
        color: "gray",
        component: () => <StandardNode>{[]}</StandardNode>,
        ...opts
    }
}

export function clientNodeHelper(globalOpts: Partial<ClientNodeDefinition>) {
    return (opts: Partial<ClientNodeDefinition>) => createClientNodeDef({ ...globalOpts, ...opts })
}

export function prefixDefinitionIds(prefix: string, definitions: Record<string, ClientNodeDefinition>) {
    return Object.fromEntries(
        Object.entries(definitions).map(([id, def]) => [`${prefix}/${id}`, def])
    )
}