import { forwardRef } from "react"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import { cn } from "@web/lib/utils"


export type RadioToggleProps = Omit<React.ComponentProps<typeof ToggleGroup>, "value" | "onValueChange" | "type" | "defaultValue"> & {
    value: string
    onValueChange: (value: string) => void
}

export const RadioToggle = forwardRef<HTMLDivElement, RadioToggleProps>(({
    value, onValueChange, children, ...props
}, ref) => {
    return (
        <ToggleGroup
            type="single"
            value={value}
            onValueChange={(newVal) => {
                // don't allow unselecting, which results in empty string
                if (newVal) onValueChange(newVal)
            }}
            {...props}
            ref={ref}
            className={cn("grid auto-cols-fr grid-flow-col border rounded-md gap-1 p-1", props.className)}
        >
            {children}
        </ToggleGroup>
    )
})
RadioToggle.displayName = ToggleGroup.displayName


export const RadioToggleOption = forwardRef<HTMLButtonElement, React.ComponentProps<typeof ToggleGroupItem>>(({
    children,
    ...props
}, ref) => {
    return (
        <ToggleGroupItem
            {...props}
            ref={ref}
            className={cn("flex-center gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground", props.className)}
        >
            {children}
        </ToggleGroupItem>
    )
})
RadioToggleOption.displayName = ToggleGroupItem.displayName