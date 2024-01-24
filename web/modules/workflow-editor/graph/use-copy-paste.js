import { useNotifications } from "@web/modules/notifications"
import { useCallback, useEffect } from "react"
import { TbClipboardCheck } from "react-icons/tb"
import { getConnectedEdges, getNodesBounds, useReactFlow, useStore, useStoreApi } from "reactflow"
import { duplicateElements } from "./duplicate"


const GRAPH_MIME_TYPE = "application/vnd.wfd.graph+json"
const CLIPBOARD_KEY = "clipboard"


export function useGraphCopyPaste() {

    const storeApi = useStoreApi()
    const { notify } = useNotifications()

    const _onCopy = useCopySelectionToClipboard()
    const onPaste = usePasteElementsFromClipboard()

    const onCopy = useCallback(() => {
        _onCopy()
        notify({
            title: null,
            message: "Copied!",
            icon: <TbClipboardCheck />,
        })
    }, [_onCopy])

    useEffect(() => {
        storeApi.setState({ copy: onCopy, paste: onPaste })
    }, [onCopy, onPaste])

    return [onCopy, onPaste]
}


export async function copyElementsToClipboard(nodes, edges) {
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

    return useCallback((position) => {
        const textContent = localStorage.getItem(CLIPBOARD_KEY) || ""

        if (!textContent.startsWith(GRAPH_MIME_TYPE))
            return

        const { nodes, edges } = JSON.parse(textContent.replace(GRAPH_MIME_TYPE, ""))

        const rect = getNodesBounds(nodes)
        const domNodeBounds = domNode?.getBoundingClientRect()

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