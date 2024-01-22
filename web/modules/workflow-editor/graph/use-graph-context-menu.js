import { useCallback } from "react"
import { useStoreApi } from "reactflow"


export function useGraphContextMenu() {
    const storeApi = useStoreApi()

    const handler = useCallback(ev => {
        ev.preventDefault()
        storeApi.setState({
            contextMenu: {
                isOpen: true,
                position: {
                    x: ev.clientX,
                    y: ev.clientY,
                },
            }
        })
    }, [storeApi])

    return handler
}