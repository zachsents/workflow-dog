import { useCallback } from "react"
import { useEditorStoreApi } from "../store"


export function useGraphContextMenu() {
    const editorStore = useEditorStoreApi()

    const handler = useCallback(ev => {
        ev.preventDefault()
        editorStore.setState({
            contextMenu: {
                isOpen: true,
                position: {
                    x: ev.clientX,
                    y: ev.clientY,
                },
            }
        })
    }, [editorStore])

    return handler
}