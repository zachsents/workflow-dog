import { customAlphabet } from "nanoid"
import { alphanumeric } from "nanoid-dictionary"


export enum IdNamespace {
    ActionNodeDefinition = "node-def",
    ActionNode = "node",
    Edge = "edge",
    TriggerDefinition = "trigger-def",
    InputHandle = "input",
    OutputHandle = "output",
    ControlInputHandle = "control-input",
    ControlOutputHandle = "control-output",
    Service = "service",
    TypeMeta = "type-meta",
}

const alphanumericGenerator = customAlphabet(alphanumeric, 16)

export function createRandomId(namespace: IdNamespace) {
    return `${namespace}:${alphanumericGenerator()}`
}

export function createSubspaceId(namespace: IdNamespace, ...parts: string[]) {
    return `${namespace}:${parts.join(".")}`
}

export function parseId(id: string) {
    const [namespace, rest] = id.split(":")
    const segments = rest.split(".")
    const name = segments.pop()!
    return {
        namespace,
        name,
        package: segments.join("."),
    }
}