import { useCallback } from "react"
import { useStoreApi } from "reactflow"


export function useGraphContextMenu() {
    const { setState } = useStoreApi()

    const handler = useCallback(ev => {
        ev.preventDefault()
        setState({
            contextMenu: {
                x: ev.clientX,
                y: ev.clientY,
            }
        })
    }, [setState])

    return [handler]
}