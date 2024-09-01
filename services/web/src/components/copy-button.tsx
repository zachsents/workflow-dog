import type React from "react"
import { Button } from "./ui/button"
import TI from "./tabler-icon"
import { IconCopy, IconCopyCheck } from "@tabler/icons-react"
import { useState } from "react"
import { useTimeoutEffect } from "@react-hookz/web"
import { cn } from "@web/lib/utils"


interface CopyButtonProps extends React.ComponentPropsWithRef<typeof Button> {
    copyText?: string
    copiedChildren?: React.ReactNode
    copiedText?: string
    delay?: number
    content: string
}

export default function CopyButton({
    content, delay = 1000,
    copyText = "Copy", children = <>
        <TI><IconCopy /></TI>
        {copyText}
    </>,
    copiedText = "Copied!", copiedChildren = <>
        <TI><IconCopyCheck /></TI>
        {copiedText}
    </>,
    ...props
}: CopyButtonProps) {

    const [copied, setCopied] = useState(false)
    const [, resetTimeout] = useTimeoutEffect(() => {
        setCopied(false)
    }, copied ? delay : undefined)

    return (
        <Button {...props} className={cn("gap-2", props.className)} onClick={(ev) => {
            props.onClick?.(ev)
            navigator.clipboard.writeText(content)
            setCopied(true)
            resetTimeout()
        }}>
            {copied ? copiedChildren : children}
        </Button>
    )
}