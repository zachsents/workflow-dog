import type { DataInterface, SharedNodeDefinition, SharedServiceDefinition, SharedTriggerDefinition, SharedTypeMetaDefinition } from "@pkg/types/shared"
import _ from "lodash"
import { IdNamespace, createSubspaceId } from "shared/utils"


export function metaUrlSegments(metaUrl: string, subdir: string) {
    const searchStr = `packages/data/${subdir}/`
    const startIndex = metaUrl.indexOf(searchStr) + searchStr.length
    return metaUrl
        .slice(startIndex)
        .match(/^[^\.]+/)?.[0]
        .split("/")
        ?? []
}

const defaultSharedNodeInterface: Partial<DataInterface> = {
    groupType: "normal",
}

export function sharedNode<Def extends SharedNodeDefinition>(
    metaUrl: string,
    def: Def,
) {
    const inputs: Record<string, DataInterface> = _.mapValues(
        def.inputs ?? {},
        (input) => _.merge({}, defaultSharedNodeInterface, input),
    )

    const outputs: Record<string, DataInterface> = _.mapValues(
        def.outputs ?? {},
        (output) => _.merge({}, defaultSharedNodeInterface, output),
    )

    return {
        ...def,
        inputs,
        outputs,
        id: createSubspaceId(IdNamespace.ActionNodeDefinition, ...metaUrlSegments(metaUrl, "nodes"))
    }
}

export function sharedTrigger(
    metaUrl: string,
    def: SharedTriggerDefinition
) {
    return {
        ...def,
        id: createSubspaceId(IdNamespace.TriggerDefinition, ...metaUrlSegments(metaUrl, "triggers"))
    }
}

export function sharedService<Def extends SharedServiceDefinition>(
    metaUrl: string,
    def: Def
) {
    return {
        ...def,
        id: createSubspaceId(IdNamespace.Service, ...metaUrlSegments(metaUrl, "services"))
    }
}

export function sharedTypeMeta<Def extends SharedTypeMetaDefinition>(
    metaUrl: string,
    def: Def
) {
    const id = createSubspaceId(IdNamespace.TypeMeta, ...metaUrlSegments(metaUrl, "type-meta"))
    return {
        ...def,
        id,
        schema: def.schema.describe(id),
    }
}