import { useHotkey } from "@web/modules/util"
import _ from "lodash"
import { useEffect } from "react"
import { useEdges, useNodes, useReactFlow, useStoreApi } from "reactflow"
import { useUndoRedo } from "./use-undo-redo"


export function useGraphUndoRedo() {

    const rf = useReactFlow()
    const storeApi = useStoreApi()
    const nodes = useNodes()
    const edges = useEdges()

    const [, undo, redo] = useUndoRedo({ nodes, edges }, ({ nodes, edges }) => {
        rf.setNodes(nodes)
        rf.setEdges(edges)
    }, {
        debounce: 200,
        equality: _.isEqual,
    })

    useEffect(() => {
        storeApi.setState({ undo, redo })
    }, [undo, redo, storeApi])

    useHotkey("mod+z", undo, {
        preventDefault: true,
        preventInInputs: true,
        callbackDependencies: [undo],
    })

    useHotkey("mod+y", redo, {
        preventDefault: true,
        preventInInputs: true,
        callbackDependencies: [redo],
    })

    return [undo, redo]
}