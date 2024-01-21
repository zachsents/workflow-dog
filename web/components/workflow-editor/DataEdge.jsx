import { Button } from "@nextui-org/react"
import classNames from "classnames"
import { forwardRef } from "react"
import { TbX } from "react-icons/tb"
import { getBezierPath, useReactFlow } from "reactflow"


const INTERACTION_PADDING = 20
const FOREIGN_OBJECT_SIZE = 60
const OVERLAP = 5
// const BROKEN_EDGE_LENGTH = 80
// const BROKEN_STROKE_DASH_ARRAY = "8 6"


export default function DataEdge(props) {

    return (
        <UnbrokenEdge {...props} />
    )
}


function UnbrokenEdge({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, selected, markerEnd, style, data: { forced } = {} }) {

    const rf = useReactFlow()

    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX: sourceX - OVERLAP,
        sourceY,
        sourcePosition,
        targetX: targetX + OVERLAP,
        targetY,
        targetPosition,
    })

    return (
        <g className="group">
            <VisiblePath
                d={edgePath}
                {...{ style, markerEnd, selected, forced }}
            />
            <InteractionPath d={edgePath} />
            <DeleteButton
                x={labelX} y={labelY}
                selected={selected}
                onPress={() => {
                    rf.deleteElements({ edges: [{ id }] })
                }}
            />
        </g>
    )
}


// function BrokenEdge({ id, sourceX, sourceY, targetX, targetY, selected, forced, markerEnd, style }) {

//     const { ref: sourcePathRef, hovered: path1Hovered } = useHover()
//     const { ref: targetPathRef, hovered: path2Hovered } = useHover()
//     const { ref: sourceLabelRef, hovered: label1Hovered } = useHover()
//     const { ref: targetLabelRef, hovered: label2Hovered } = useHover()
//     const hovered = path1Hovered || path2Hovered || label1Hovered || label2Hovered

//     const deleteEdge = useDeleteElements([], [id])

//     const [solidSourcePath, dashedSourcePath, sourceInteractionPath, sourceLabelX, sourceLabelY] = generatePaths(sourceX, sourceY, targetX, targetY, BROKEN_EDGE_LENGTH)
//     const [solidTargetPath, dashedTargetPath, targetInteractionPath, targetLabelX, targetLabelY] = generatePaths(targetX, targetY, sourceX, sourceY, BROKEN_EDGE_LENGTH)

//     return (
//         <g>
//             <VisiblePath
//                 d={solidSourcePath}
//                 {...{ style, markerEnd, hovered, selected, forced }}
//             />
//             <VisiblePath
//                 d={dashedSourcePath}
//                 style={{
//                     ...style,
//                     strokeDasharray: BROKEN_STROKE_DASH_ARRAY,
//                 }}
//                 {...{ markerEnd, hovered, selected, forced }}
//             />
//             <InteractionPath
//                 d={sourceInteractionPath}
//                 ref={sourcePathRef}
//             />
//             <DeleteButton
//                 x={sourceLabelX} y={sourceLabelY}
//                 show={hovered || selected}
//                 onClick={deleteEdge}
//                 ref={sourceLabelRef}
//             />


//             <VisiblePath
//                 d={solidTargetPath}
//                 {...{ style, markerEnd, hovered, selected, forced }}
//             />
//             <VisiblePath
//                 d={dashedTargetPath}
//                 style={{
//                     ...style,
//                     strokeDasharray: BROKEN_STROKE_DASH_ARRAY,
//                 }}
//                 {...{ markerEnd, hovered, selected, forced }}
//             />
//             <InteractionPath
//                 d={targetInteractionPath}
//                 ref={targetPathRef}
//             />
//             <DeleteButton
//                 x={targetLabelX} y={targetLabelY}
//                 show={hovered || selected}
//                 onClick={deleteEdge}
//                 ref={targetLabelRef}
//             />
//         </g>
//     )
// }


const DeleteButton = forwardRef(function DeleteButton({ x, y, selected, onPress, ...props }, ref) {
    return (
        <foreignObject
            width={FOREIGN_OBJECT_SIZE}
            height={FOREIGN_OBJECT_SIZE}
            x={x - FOREIGN_OBJECT_SIZE / 2}
            y={y - FOREIGN_OBJECT_SIZE / 2}
            className="pointer-events-none"
            {...props}
            ref={ref}
        >
            <div className="w-full h-full flex justify-center items-center">
                <Button
                    isIconOnly radius="full" size="sm"
                    className={classNames(
                        "pointer-events-auto transition !duration-100 group-hover:opacity-100 group-hover:scale-100 hover:bg-danger hover:text-white",
                        selected ? "opacity-100 scale-100" : "opacity-0 scale-50"
                    )}
                    onPress={onPress}
                >
                    <TbX />
                </Button>
            </div>
        </foreignObject>
    )
})


const VisiblePath = forwardRef(function VisiblePath({ d, style, markerEnd, selected, forced, ...props }, ref) {
    return (<>
        <path
            d={d}
            markerEnd={markerEnd}
            className="stroke-white stroke-[8px] fill-none"
        />
        <path
            d={d}
            markerEnd={markerEnd}
            className={classNames("fill-none stroke-gray-300 stroke-[5px] transition-colors", {
                "stroke-primary-400": !forced && selected,
                "group-hover:stroke-primary-300": !forced && !selected,
                "stroke-red-500": forced && selected,
                "stroke-red-200 group-hover:stroke-red-400": forced && !selected,
            })}
            style={style}
            {...props}
            ref={ref}
        />
    </>)
})


const InteractionPath = forwardRef(function InteractionPath({ d, ...props }, ref) {
    return (
        <path
            d={d}
            className="stroke-none fill-none"
            style={{ strokeWidth: INTERACTION_PADDING }}
            {...props}
            ref={ref}
        />
    )
})


// function generatePaths(x1, y1, x2, y2, distance, proportion = 0.4) {
//     // Calculate the direction from A to B
//     var dx = x2 - x1
//     var dy = y2 - y1

//     // Calculate the total distance from A to B
//     var length = Math.sqrt(dx * dx + dy * dy)

//     // If the total distance is zero, A and B are the same point
//     if (length === 0) {
//         return null // or handle this case as needed
//     }

//     // Normalize the direction vector
//     dx /= length
//     dy /= length

//     // Calculate the new end point, distance away from A in the direction of B
//     const midX = x1 + distance * dx * proportion
//     const midY = y1 + distance * dy * proportion
//     const endX = x1 + distance * dx
//     const endY = y1 + distance * dy

//     return [
//         `M ${x1} ${y1} L ${midX} ${midY}`,
//         `M ${midX} ${midY} L ${endX} ${endY}`,
//         `M ${x1} ${y1} L ${endX} ${endY}`,
//         midX, midY,
//     ]
// }

