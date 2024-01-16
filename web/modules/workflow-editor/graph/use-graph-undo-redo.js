import { useKeyboardEvent } from "@react-hookz/web"
import _ from "lodash"
import { useCallback, useEffect, useMemo } from "react"
import { useStoreApi } from "reactflow"
import { useUndoRedo } from "./use-undo-redo"


export function useGraphUndoRedo(nodes, edges) {

    const { getState, setState } = useStoreApi()

    const graphState = useMemo(() => ({ nodes, edges }), [nodes, edges])

    const setGraphState = useCallback(({ nodes, edges }) => {
        getState().setNodes(nodes)
        getState().setEdges(edges)
    }, [])

    const [, undo, redo] = useUndoRedo(graphState, setGraphState, {
        debounce: 200,
        equality: _.isEqual,
    })

    useEffect(() => {
        setState({ undo, redo })
    }, [undo, redo])

    useKeyboardEvent(ev => ev.metaKey && ev.key === "z", undo, [undo])
    useKeyboardEvent(ev => ev.metaKey && ev.key === "y", redo, [redo])

    return [undo, redo]
}