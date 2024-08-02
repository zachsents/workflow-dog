import { cn } from "@web/lib/utils"


interface KbdProps extends React.HTMLAttributes<HTMLElement> {
    children: string | string[]
}

export default function Kbd({ children, ...props }: KbdProps) {

    props.className = cn(
        "text-xs border text-muted-foreground rounded-sm px-1 bg-white",
        props.className
    )

    if (Array.isArray(children))
        return (
            <div className="flex-center gap-1">
                {children.map((key, i) =>
                    <kbd key={key + i} {...props}>
                        {key}
                    </kbd>
                )}
            </div>
        )

    return (
        <kbd {...props}>
            {children}
        </kbd>
    )
}