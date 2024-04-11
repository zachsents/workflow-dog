"use client"

import { Button } from "@web/components/ui/button"
import { useHover } from "@web/lib/client/hooks"
import { cn } from "@web/lib/utils"
import { useEditorStore } from "@web/modules/workflow-editor/store"
import { TbX } from "react-icons/tb"
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath, useReactFlow } from "reactflow"


const OVERLAP = 0


export default function DataEdge({
    id,
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    selected,
    data,
}: EdgeProps) {

    const rf = useReactFlow()

    const [path, labelX, labelY] = getBezierPath({
        sourceX: sourceX - OVERLAP,
        sourceY,
        sourcePosition,
        targetX: targetX + OVERLAP,
        targetY,
        targetPosition,
    })

    const [groupRef, isGroupHovered] = useHover<SVGGElement>()
    const [labelRef, isLabelHovered] = useHover<HTMLDivElement>()

    const showLabel = isGroupHovered || isLabelHovered || selected

    const hasSelectedRun = useEditorStore(s => !!s.selectedRunId)

    return (<>
        <g ref={groupRef}>
            {/* Background Path */}
            <path
                d={path}
                className="fill-none stroke-slate-50"
                style={{ strokeWidth: 8, strokeDasharray: "none", animation: "none" }}
            />

            {/* Main Path */}
            <g className={cn(
                "*:transition-colors",
                selected
                    ? "text-violet-500"
                    : showLabel
                        ? "text-violet-400"
                        : "text-neutral-600"
            )}>
                <BaseEdge
                    id={id}
                    path={path}
                    style={{
                        strokeWidth: 3,
                        stroke: "currentColor",
                        strokeLinecap: "round",
                        strokeDasharray: data?.forced ? "5 5" : undefined,
                    }}
                />
            </g>
        </g>
        {!hasSelectedRun &&
            <EdgeLabelRenderer>
                <div
                    // z-index of 1000 is required to make sure the label is above the edge
                    className="group absolute -translate-x-1/2 -translate-y-1/2 flex center pointer-events-auto z-[1002]"
                    style={{
                        top: labelY,
                        left: labelX,
                    }}
                    ref={labelRef}
                >
                    <div className={cn(
                        "transition-opacity",
                        showLabel ? "opacity-100" : "opacity-0",
                    )}>
                        <Button
                            variant="destructive" size="icon"
                            className="scale-75 group-hover:scale-100 transition-transform rounded-full"
                            onClick={ev => {
                                ev.stopPropagation()
                                rf.setEdges(edges => edges.filter(edge => edge.id !== id))
                            }}
                        >
                            <TbX />
                        </Button>

                        {/* {data.forced &&
                        <Card className="absolute bottom-full left-1/2 -translate-x-1/2 text-[0.4rem] font-bold text-center flex center px-1 rounded-sm pointer-events-none">
                            Forced
                        </Card>} */}
                    </div>
                </div>
            </EdgeLabelRenderer>}
    </>)
}

