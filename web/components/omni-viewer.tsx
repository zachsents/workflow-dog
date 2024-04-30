"use client"

import { extendComponent } from "@web/modules/util"
import ObjectViewer from "./object-viewer"


export const OmniPreview = extendComponent<"p">(({ children, ...props }, ref) =>
    <p {...props} ref={ref}>{toStringPreview(children)}</p>
)


function toStringPreview(value: any) {
    if (value == null)
        return "null"

    if (typeof value === "object" && value != null) {
        if (Array.isArray(value))
            return `List - ${value.length} items`

        return `Object - ${Object.keys(value).length} properties`
    }

    return `${value}`
}


export function OmniViewer({ children }: { children: any }) {
    if (children == null)
        return <span className="text-muted-foreground">null</span>

    if (typeof children === "object" && children != null) {
        // if (Array.isArray(children))
        //     return <ObjectViewer>{}</ObjectViewer>

        return <ObjectViewer>{children}</ObjectViewer>
    }

    if (typeof children === "string")
        return <span className="whitespace-pre-wrap">{children}</span>

    return <span>{children}</span>
}