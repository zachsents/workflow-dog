import { IdNamespace } from "shared/utils"
import * as nodeDefs from "./build/barrels/nodes.execution"
import { Registry } from "./build/utils"
import type { ExecutionNodeExport } from "./types/execution"

export const NodeDefinitions = new Registry<ExecutionNodeExport>(
    IdNamespace.ActionNodeDefinition,
    nodeDefs
)