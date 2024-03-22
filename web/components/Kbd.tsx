import { cn } from "@web/lib/utils"


export default function Kbd(props: JSX.IntrinsicElements["kbd"]) {
    return (
        <kbd
            {...props}
            className={cn(
                "text-xs border text-muted-foreground rounded-sm px-1 bg-white",
                props.className
            )}
        />
    )
}