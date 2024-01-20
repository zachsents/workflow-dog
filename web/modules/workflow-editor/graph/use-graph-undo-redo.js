import { useHotkey } from "@web/modules/util"
import _ from "lodash"
import { useEffect } from "react"
import { useEdges, useNodes, useReactFlow, useStoreApi } from "reactflow"
import { useUndoRedo } from "./use-undo-redo"


export function useGraphUndoRedo() {

    const rf = useReactFlow()
    const { setState } = useStoreApi()

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
        setState({ undo, redo })
    }, [undo, redo])

    useHotkey("mod+z", undo, {
        preventDefault: true,
        callbackDependencies: [undo],
    })

    useHotkey("mod+y", redo, {
        preventDefault: true,
        callbackDependencies: [redo],
    })

    return [undo, redo]
}