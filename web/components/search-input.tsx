import { plural } from "@web/modules/grammar"
import { useRef } from "react"
import { useHotkeys } from "react-hotkeys-hook"
import { TbSearch, TbX } from "react-icons/tb"
import Kbd from "./kbd"
import { Button } from "./ui/button"
import { Input } from "./ui/input"


interface SearchInputProps {
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
                className="bg-white px-10 peer"
                value={value}
                onChange={ev => onValueChange(ev.currentTarget.value)}
                ref={ref}
            />
            <TbSearch
                className="absolute top-1/2 left-0 -translate-y-1/2 pointer-events-none w-10 opacity-50 peer-focus:opacity-100"
            />
            <Button
                size="icon" variant="ghost"
                className="absolute top-1/2 right-0 -translate-y-1/2 hidden peer-focus:flex group-hover:flex"
                onClick={() => {
                    onValueChange("")
                    ref.current?.focus()
                }}
            >
                <TbX />
            </Button>

            {withHotkey &&
                <Kbd className="absolute top-1/2 right-2 -translate-y-1/2 peer-focus:hidden group-hover:hidden">/</Kbd>}
        </div>
    )
}