import _ from "lodash"
import { useEffect } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { useEdges, useNodes, useReactFlow } from "reactflow"
import { useEditorStoreApi } from "../store"
import { useUndoRedo } from "./use-undo-redo"


export function useGraphUndoRedo() {

    const rf = useReactFlow()
    const editorStore = useEditorStoreApi()
    const nodes = useNodes()
    const edges = useEdges()

    const graph = { nodes, edges }

    const [, undo, redo] = useUndoRedo<typeof graph>(graph, ({ nodes, edges }) => {
        rf.setNodes(nodes)
        rf.setEdges(edges)
    }, {
        debounce: 200,
        equality: _.isEqual,
    })

    useEffect(() => {
        editorStore.setState({ undo, redo })
    }, [undo, redo, editorStore])

    useHotkeys("mod+z", undo, {
        preventDefault: true,
    }, [undo])

    useHotkeys("mod+y", redo, {
        preventDefault: true,
    }, [redo])

    return [undo, redo]
}