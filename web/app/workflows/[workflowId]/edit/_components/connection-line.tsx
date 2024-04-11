import { useHandleRect } from "@web/modules/workflow-editor/graph/nodes"
import { getBezierPath, type ConnectionLineComponentProps, Position, useStore } from "reactflow"

export default function ConnectionLine({
    fromX, fromY, fromPosition,
    toX, toY, toPosition,
    fromHandle,
}: ConnectionLineComponentProps) {

    const multiplier = fromHandle?.position === Position.Left ? -1 : 1

    const sourceX = fromX + multiplier * (fromHandle?.width || 0) / 2

    const endHandle = useStore(s => s.connectionEndHandle)
    const endHandleRect = useHandleRect(endHandle?.nodeId || null, endHandle?.handleId!)
    const targetX = endHandle
        ? toX - multiplier * endHandleRect.width / 2
        : toX

    const [path] = getBezierPath({
        sourceX,
        sourceY: fromY,
        sourcePosition: fromPosition,
        targetX,
        targetY: toY,
        targetPosition: toPosition,
    })

    return (
        <g>
            <path
                d={path}
                className="animated fill-none stroke-neutral-400"
                strokeWidth={3}
            />
            <circle
                cx={targetX} cy={toY} r={4}
                className="stroke-none fill-violet-500"
            />
        </g>
    )
}
