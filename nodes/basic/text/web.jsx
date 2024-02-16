import { TbAbc } from "react-icons/tb"
import colors from "tailwindcss/colors"
import { useNodeProperty, useNodePropertyValue } from "@web/modules/workflow-editor/graph/nodes"
import { Textarea } from "@nextui-org/react"
import { useRef, useEffect, useState } from "react"


export default {
    icon: TbAbc,
    color: colors.gray[800],
    tags: ["Text", "Basic"],
    outputs: {
        text: {
            bullet: true,
        }
    },
    renderNode: () => {
        const ref = useRef()
        const selected = useNodePropertyValue(undefined, "selected")
        useEffect(() => {
            if (selected)
                ref.current?.focus()
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
                    size="sm" variant="bordered"
                    className="nodrag my-unit-sm bg-white"
                    classNames={{
                        input: "text-tiny min-w-[13ch] max-w-[28ch] w-[calc(var(--chars)*1ch+1rem)]"
                    }}
                    style={{
                        "--chars": textLength,
                    }}
                    placeholder="Type something..."
                    ref={ref}
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
}