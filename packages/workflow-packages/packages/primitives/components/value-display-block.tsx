import { cn } from "web/src/lib/utils"

export interface ValueDisplayBlockProps extends React.ComponentPropsWithRef<"div"> {
    label: React.ReactNode
}

export default function ValueDisplayBlock({ label, children, ...props }: ValueDisplayBlockProps) {
    return (
        <div
            {...props}
            className={cn("grid gap-2", props.className)}
        >
            <p className="text-xs text-muted-foreground">{label}</p>
            {children}
        </div>
    )
}