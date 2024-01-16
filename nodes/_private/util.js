import { useReactFlow, useStore } from "reactflow"
import _ from "lodash"
import { produce } from "immer"


export function useNodeProperty(id, path) {
    const rf = useReactFlow()

    const value = useStore(s => _.get(s.nodeInternals.get(id), path))

    const setValue = newValue => rf.setNodes(produce(draft => {
        const node = draft.find(n => n.id == id)
        _.set(node, path, newValue)
    }))

    return [value, setValue]
}