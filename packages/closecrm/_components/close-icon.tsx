import React, { forwardRef } from "react"
import CloseIconSvg from "../close.svg"
import { cn } from "@web/lib/utils"


const CloseIcon = forwardRef<React.ElementRef<"svg">, React.ComponentPropsWithoutRef<"svg">>((props, ref) => {
    return <CloseIconSvg
        {...props}
        className={cn("w-[1em] h-[1em] [&_path]:fill-current", props.className)}
        ref={ref}
    />
})

export default CloseIcon