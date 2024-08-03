import { IconSearch, IconX } from "@tabler/icons-react"
import { Button } from "@ui/button"
import { Input } from "@ui/input"
import { plural } from "@web/lib/grammar"
import { cn } from "@web/lib/utils"
import React, { useRef } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import Kbd from "./kbd"
import TI from "./tabler-icon"


interface SearchInputProps extends React.ComponentPropsWithoutRef<typeof Input> {
    value: string
    onValueChange: (value: string) => void
    quantity?: number | null | undefined
    noun?: string
    withHotkey?: boolean
}

export default function SearchInput({
    value,
    onValueChange,
    quantity,
    noun = "item",
    withHotkey,
    ...props
}: SearchInputProps) {

    const ref = useRef<HTMLInputElement>(null)

    useHotkeys("/", () => {
        if (withHotkey)
            ref.current?.focus()
    }, {
        preventDefault: true,
    })

    return (
        <div className="relative group">
            <Input
                placeholder={typeof quantity === "number"
                    ? `Search ${quantity} ${plural(noun, quantity)}`
                    : `Search ${noun}`}
                value={value}
                ref={ref}
                {...props}
                onChange={ev => {
                    onValueChange(ev.currentTarget.value)
                    props.onChange?.(ev)
                }}
                className={cn("bg-white px-10 rounded-full peer", props.className)}
            />
            <TI>
                <IconSearch
                    className="absolute top-1/2 left-0 -translate-y-1/2 pointer-events-none w-10 opacity-50 peer-focus:opacity-100"
                />
            </TI>
            <Button
                size="icon" variant="ghost"
                className="absolute right-0 hack-center-y rounded-full hidden peer-focus:flex group-hover:flex"
                onClick={() => {
                    onValueChange("")
                    ref.current?.focus()
                }}
            >
                <TI>
                    <IconX />
                </TI>
            </Button>

            {withHotkey &&
                <Kbd className="absolute right-3 hack-center-y peer-focus:hidden group-hover:hidden">
                    /
                </Kbd>}
        </div>
    )
}