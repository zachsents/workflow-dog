import { useCallback, useEffect } from "react"
import type { Edge, Node, XYPosition } from "reactflow"
import { getConnectedEdges, getNodesBounds, useReactFlow, useStore } from "reactflow"
import { toast } from "sonner"
import { useEditorStoreApi } from "../store"
import { duplicateElements } from "./duplicate"


const GRAPH_MIME_TYPE = "application/vnd.wfd.graph+json"
const CLIPBOARD_KEY = "clipboard"


export function useGraphCopyPaste() {

    const editorStore = useEditorStoreApi()

    const _onCopy = useCopySelectionToClipboard()
    const onPaste = usePasteElementsFromClipboard()

    const onCopy = useCallback(() => {
        _onCopy()
        toast.success("Copied!")
    }, [_onCopy])

    useEffect(() => {
        editorStore.setState({ copy: onCopy, paste: onPaste })
    }, [onCopy, onPaste])

    return [onCopy, onPaste] as const
}


export function copyElementsToClipboard(nodes: Node[], edges: Edge[]) {
    return localStorage.setItem(CLIPBOARD_KEY, (GRAPH_MIME_TYPE + JSON.stringify({
        nodes,
        edges: getConnectedEdges(nodes, edges),
    })))
}


export function useCopySelectionToClipboard() {
    const rf = useReactFlow()

    return useCallback(() => {
        const selectedNodes = rf.getNodes().filter(n => n.selected)
        const selectedEdges = rf.getEdges().filter(e => e.selected)
        copyElementsToClipboard(selectedNodes, selectedEdges)
    }, [rf])
}


export function usePasteElementsFromClipboard() {

    const rf = useReactFlow()
    const domNode = useStore(s => s.domNode)

    return useCallback((position?: XYPosition) => {
        const textContent = localStorage.getItem(CLIPBOARD_KEY) || ""

        if (!textContent.startsWith(GRAPH_MIME_TYPE))
            return

        const { nodes, edges }: {
            nodes: Node[]
            edges: Edge[]
        } = JSON.parse(textContent.replace(GRAPH_MIME_TYPE, ""))

        const rect = getNodesBounds(nodes)
        const domNodeBounds = domNode!.getBoundingClientRect()

        const center = position || rf.screenToFlowPosition({
            x: domNodeBounds.x + domNodeBounds.width / 2,
            y: domNodeBounds.y + domNodeBounds.height / 2,
        })

        duplicateElements(rf, nodes, edges, {
            position: {
                x: center.x - rect.width / 2,
                y: center.y - rect.height / 2,
            },
        })
    }, [rf, domNode])
}

export type CopyHandler = ReturnType<typeof useCopySelectionToClipboard>
export type PasteHandler = ReturnType<typeof usePasteElementsFromClipboard>