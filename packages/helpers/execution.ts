import { ExecutionNodeDefinition } from "@pkg/types/execution"
import _ from "lodash"
import { sharedNode } from "./shared"

export function executionNode<Shared extends ReturnType<typeof sharedNode>>(
    sharedDef: Shared,
    def: ExecutionNodeDefinition<Shared>,
) {
    return _.merge({}, sharedDef, def)
}