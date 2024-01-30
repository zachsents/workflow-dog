import { TbAbc } from "react-icons/tb"
import colors from "tailwindcss/colors"
import { useNodeProperty, useNodePropertyValue } from "@web/modules/workflow-editor/graph/nodes"
import { Textarea } from "@nextui-org/react"
import { useRef, useEffect } from "react"


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

        return (
            <div className="relative">
                <Textarea
                    defaultValue={value ?? ""}
                    onValueChange={setValue}
                    minRows={1}
                    maxRows={12}
                    size="sm" variant="bordered"
                    className="nodrag my-unit-sm relative translate-x-6 bg-white text-tiny"
                    classNames={{
                        input: "text-tiny"
                    }}
                    placeholder="Type something..."
                    ref={ref}
                />
                <p className="absolute bottom-full text-tiny text-default-500 left-8">
                    Text
                </p>
            </div>
        )
    },
}