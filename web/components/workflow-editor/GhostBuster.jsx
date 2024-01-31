import { useDebouncedEffect } from "@react-hookz/web"
import { useMountDelay } from "@web/modules/util"
import _ from "lodash"
import { useReactFlow, useStore } from "reactflow"


export default function GhostBuster() {

    const rf = useReactFlow()

    const handleMap = useStore(state => Object.fromEntries(
        [...state.nodeInternals.values()].map(node => {
            const handleBounds = node[Symbol.for("internals")]?.handleBounds

            return [
                node.id,
                [...(handleBounds?.source?.map(h => h.id) ?? []), ...(handleBounds?.target?.map(h => h.id) ?? [])],
            ]
        })
    ), _.isEqual)

    const isReadyToSave = useMountDelay(2000, {
        callback: () => console.debug("[GhostBuster] Ready to work!"),
    })

    useDebouncedEffect(() => {
        if (!isReadyToSave) return

        const edgesToRemove = rf.getEdges().filter(edge => {
            const sourceExists = handleMap[edge.source]?.includes(edge.sourceHandle)
            const targetExists = handleMap[edge.target]?.includes(edge.targetHandle)
            return !(sourceExists && targetExists)
        })
        if (edgesToRemove.length > 0) {
            console.debug(`[GhostBuster] Removing ${edgesToRemove.length} edges:`, edgesToRemove.map(e => e.id).join(", "))
            rf.deleteElements({ edges: edgesToRemove })
        }
    }, [rf, handleMap], 100)
}
