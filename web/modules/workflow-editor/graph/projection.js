import { useMemo } from "react"
import { useViewport } from "reactflow"
import { RF_ELEMENT_ID } from "."


/**
 * @param {import("reactflow").Viewport} viewport
 * @param {object} rect
 * @param {number} rect.x
 * @param {number} rect.y
 * @param {number} [rect.width]
 * @param {number} [rect.height]
 */


export function projectRFToScreen(viewport, { x, y, width, height } = {}) {

    const result = {}

    if (x !== undefined)
        result.x = x * viewport.zoom + viewport.x

    if (y !== undefined)
        result.y = y * viewport.zoom + viewport.y

    if (width !== undefined)
        result.width = width * viewport.zoom

    if (height !== undefined)
        result.height = height * viewport.zoom

    return result
}


export function useProjectRFToScreen(rect) {
    const viewport = useViewport()
    return useMemo(() => rect && projectRFToScreen(viewport, rect), [viewport, rect])
}


export function projectViewportCenterToRF(rf) {
    const rect = global.document.getElementById(RF_ELEMENT_ID).getBoundingClientRect()

    return rf.project({
        x: rect.width / 2,
        y: rect.height / 2,
    })
}


export function projectAbsoluteScreenPointToRF(rf, { x, y }) {
    const rect = global.document.getElementById(RF_ELEMENT_ID).getBoundingClientRect()

    return rf.project({
        x: x - rect.x,
        y: y - rect.y,
    })
}