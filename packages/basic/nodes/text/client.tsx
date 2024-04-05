import { useNodeProperty, useNodePropertyValue } from "@web/modules/workflow-editor/graph/nodes"
import { type RefObject, useEffect, useRef, useState } from "react"
import { TbAbc } from "react-icons/tb"
import { createClientNodeDefinition } from "@pkg/types"
import shared from "./shared"
import { Textarea } from "@web/components/ui/textarea"


export default createClientNodeDefinition(shared, {
    icon: TbAbc,
    color: "#1f2937",
    tags: ["Text", "Basic"],
    inputs: {},
    outputs: {
        text: {
            bullet: true,
        }
    },
    renderBody: () => {
        const inputRef = useRef<HTMLTextAreaElement>(null)
        const selected = useNodePropertyValue(undefined, "selected")
        useEffect(() => {
            if (selected)
                inputRef.current?.focus()
        }, [selected])

        const [value, setValue] = useNodeProperty(undefined, "data.state.value", {
            debounce: 200,
        })
        const [textLength, setTextLength] = useState(value?.length ?? 0)

        return (
            <Textarea
                defaultValue={value ?? ""}
                onChange={ev => {
                    setValue(ev.currentTarget.value)
                    setTextLength(ev.currentTarget.value.length)
                }}
                className="nodrag nopan min-w-[13ch] max-w-[28ch] resize-none shadow-none"
                style={{
                    width: `calc(${Math.min(28, Math.max(12, textLength))}ch + 1rem)`,
                    height: `calc(${Math.min(12, Math.max(0, Math.ceil(textLength / 28)))}em + 2em)`,
                    // "--rows": Math.min(12, Math.max(1, Math.ceil(textLength / 28))),
                }}
                placeholder="Type something..."
                ref={inputRef}

                onCopy={ev => void ev.stopPropagation()}
                onPaste={ev => void ev.stopPropagation()}
                onWheel={ev => void ev.stopPropagation()}
                onScroll={ev => void ev.stopPropagation()}
            />
        )
    },
})