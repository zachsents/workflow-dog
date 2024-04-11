import { useIsMounted, useWindowSize } from "@react-hookz/web"
import { useBooleanState } from "@web/lib/client/hooks"
import type { OnEventKeys } from "@web/lib/utils"
import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"


interface PortalProps {
    children: any
    parent?: Element
    parentRef?: React.RefObject<Element>
    stopPropagation?: Array<OnEventKeys>
    useRefs?: boolean
}

export function Portal({ children, parent: _parent, parentRef, stopPropagation = [], useRefs }: PortalProps) {

    const isMounted = useIsMounted()
    const [isDocumentDefined, documentDefined] = useBooleanState()
    useEffect(() => {
        if (typeof document !== "undefined")
            documentDefined()
    })
    useWindowSize()

    const isParentReady = _parent === undefined
        ? parentRef?.current === undefined
            ? isDocumentDefined
            : !!parentRef?.current
        : !!_parent

    const parent = isParentReady
        ? (_parent ?? parentRef?.current ?? document.body)
        : undefined

    const containerXRef = useRef<number>(0)
    const containerYRef = useRef<number>(0)
    const childWidthRef = useRef<number>(0)
    const childHeightRef = useRef<number>(0)
    const isReadyRefs = containerXRef.current && containerYRef.current && childWidthRef.current && childHeightRef.current

    const [containerXState, setContainerXState] = useState(0)
    const [containerYState, setContainerYState] = useState(0)
    const [childWidthState, setChildWidthState] = useState(0)
    const [childHeightState, setChildHeightState] = useState(0)
    const isReadyState = containerXState && containerYState && childWidthState && childHeightState

    const containerX = useRefs ? containerXRef.current : containerXState
    const containerY = useRefs ? containerYRef.current : containerYState
    const childWidth = useRefs ? childWidthRef.current : childWidthState
    const childHeight = useRefs ? childHeightRef.current : childHeightState
    const isReady = useRefs ? isReadyRefs : isReadyState

    function containerRef(el: HTMLDivElement) {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const newContainerX = rect.x + rect.width / 2 + document.documentElement.scrollLeft
        const newContainerY = rect.y + rect.height / 2 + document.documentElement.scrollTop

        if (useRefs) {
            containerXRef.current = newContainerX
            containerYRef.current = newContainerY
        } else {
            setContainerXState(newContainerX)
            setContainerYState(newContainerY)
        }
    }

    function childRef(el: HTMLDivElement) {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const newChildWidth = rect.width
        const newChildHeight = rect.height

        if (useRefs) {
            childWidthRef.current = newChildWidth
            childHeightRef.current = newChildHeight
        } else {
            setChildWidthState(newChildWidth)
            setChildHeightState(newChildHeight)
        }
    }

    return (
        <div
            style={{
                width: childWidth,
                height: childHeight,
            }}
            ref={containerRef}
        >
            {isMounted() && isParentReady &&
                createPortal(
                    <div
                        className="absolute z-50 -translate-x-1/2 -translate-y-1/2"
                        style={{
                            top: containerY,
                            left: containerX,
                            opacity: isReady ? 1 : 0,
                        }}
                        ref={childRef}

                        {...Object.fromEntries(stopPropagation?.map(eventName => [
                            eventName,
                            (ev: Event) => ev.stopPropagation()
                        ]))}
                    >
                        {children}
                    </div>,
                    parent!
                )}
        </div>
    )
}
