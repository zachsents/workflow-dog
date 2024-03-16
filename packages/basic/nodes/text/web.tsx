import { Textarea } from "@nextui-org/react"
import { useNodeProperty, useNodePropertyValue } from "@web/modules/workflow-editor/graph/nodes"
import { type RefObject, useEffect, useRef, useState } from "react"
import { TbAbc } from "react-icons/tb"
import { WebNodeDefinition } from "@types"
import type shared from "./shared"


export default {
    icon: TbAbc,
    color: "#1f2937",
    tags: ["Text", "Basic"],
    inputs: {},
    outputs: {
        text: {
            bullet: true,
        }
    },
    renderNode: () => {
        const inputRef: RefObject<HTMLTextAreaElement> = useRef()

        const selected = useNodePropertyValue(undefined, "selected")

        useEffect(() => {
            if (selected)
                inputRef.current?.focus()
        }, [selected])

        const [value, setValue] = useNodeProperty(undefined, "data.state.value", {
            debounce: 200,
        })

        const [textLength, setTextLength] = useState(0)

        return (
            <div className="relative">
                <Textarea
                    defaultValue={value ?? ""}
                    onValueChange={val => {
                        setValue(val)
                        setTextLength(val.length)
                    }}
                    minRows={1}
                    maxRows={12}
                    size="sm" variant="bordered" radius="sm"
                    className="nodrag my-unit-sm"
                    classNames={{
                        input: "text-tiny min-w-[13ch] max-w-[28ch] w-[calc(var(--chars)*1ch+1rem)]",
                        inputWrapper: "bg-white",
                    }}
                    style={{
                        "--chars": textLength,
                    } as any}
                    placeholder="Type something..."
                    ref={inputRef}
                    onCopy={ev => {
                        ev.stopPropagation()
                    }}
                    onPaste={ev => {
                        ev.stopPropagation()
                    }}
                />
                <p className="absolute bottom-full text-tiny text-default-500 left-2">
                    Text
                </p>
            </div>
        )
    },
} satisfies WebNodeDefinition<typeof shared>