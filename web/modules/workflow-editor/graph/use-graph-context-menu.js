import { useCallback } from "react"
import { useReactFlow, useStoreApi } from "reactflow"
import { projectAbsoluteScreenPointToRF } from "./projection"
import { RF_ELEMENT_ID } from "."


export function useGraphContextMenu() {
    const rf = useReactFlow()

    const { setState } = useStoreApi()

    const handler = useCallback(ev => {
        ev.preventDefault()

        const rect = global.document.getElementById(RF_ELEMENT_ID).getBoundingClientRect()

        const screenPosition = {
            x: ev.clientX - rect.x,
            y: ev.clientY - rect.y,
        }

        setState({
            contextMenu: {
                opened: true,
                screenPosition,
                graphPosition: projectAbsoluteScreenPointToRF(rf, screenPosition),
            }
        })
    }, [rf])

    return [handler]
}