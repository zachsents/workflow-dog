import { useIsMounted, useWindowSize } from "@react-hookz/web"
import { useBooleanState } from "@web/lib/client/hooks"
import type { OnEventKeys } from "@web/lib/utils"
import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"


interface PortalProps {
    children: any
    parent?: HTMLElement | React.RefObject<HTMLElement>
    stopPropagation?: Array<OnEventKeys>
}

export function Portal({ children, parent, stopPropagation = [] }: PortalProps) {

    const isMounted = useIsMounted()
    const [isDocumentDefined, documentDefined] = useBooleanState()
    useEffect(() => {
        if (typeof document !== "undefined")
            documentDefined()
    })
    useWindowSize()

    const [containerX, setContainerX] = useState(0)
    const [containerY, setContainerY] = useState(0)
    const [childWidth, setChildWidth] = useState(0)
    const [childHeight, setChildHeight] = useState(0)
    const isReady = containerX && containerY && childWidth && childHeight

    function containerRef(el: HTMLDivElement) {
        if (!el) return
        const rect = el.getBoundingClientRect()
        setContainerX(rect.x + rect.width / 2 + document.documentElement.scrollLeft)
        setContainerY(rect.y + rect.height / 2 + document.documentElement.scrollTop)
    }

    function childRef(el: HTMLDivElement) {
        if (!el) return
        const rect = el.getBoundingClientRect()
        setChildWidth(rect.width)
        setChildHeight(rect.height)
    }

    return (
        <div
            style={{
                width: childWidth,
                height: childHeight,
            }}
            ref={containerRef}
        >
            {isMounted() && isDocumentDefined &&
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
                    (parent instanceof HTMLElement ? parent : parent?.current) ?? document.body
                )}
        </div>
    )
}