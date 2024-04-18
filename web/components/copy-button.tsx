import { useTimeoutEffect } from "@react-hookz/web"
import { Button } from "@ui/button"
import { useBooleanState } from "@web/lib/client/hooks"
import { cn } from "@web/lib/utils"
import React, { forwardRef } from "react"
import { TbCheck, TbCopy } from "react-icons/tb"

const CopyButton = forwardRef<React.ElementRef<typeof Button>, React.ComponentPropsWithoutRef<typeof Button>>(({ children, ...props }, ref) => {

    const [active, activate, deactivate] = useBooleanState()
    const [cancelTimeout, resetTimeout] = useTimeoutEffect(deactivate, 1000)

    return (
        <Button
            {...props}
            onClick={(...args) => {
                activate()
                cancelTimeout()
                resetTimeout()
                props.onClick?.(...args)
            }}
            className={cn("flex center gap-2", props.className)}
            ref={ref}
        >
            {active ? <TbCheck /> : <TbCopy />}
            {active ? "Copied!" : children}
        </Button>
    )
})

export default CopyButton