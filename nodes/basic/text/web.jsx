import { TbAbc } from "react-icons/tb"
import colors from "tailwindcss/colors"
import { useNodeProperty } from "../../_private/util"
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
    renderBody: () => {

        const ref = useRef()
        const [selected] = useNodeProperty(undefined, "selected")
        useEffect(() => {
            if (selected)
                ref.current?.focus()
        }, [selected])

        const [value, setValue] = useNodeProperty(undefined, "data.state.value")

        return (
            <div className="flex justify-center items-stretch pr-unit-xs py-unit-xs">
                <Textarea
                    value={value ?? ""}
                    onValueChange={setValue}
                    minRows={1}
                    maxRows={12}
                    size="sm"
                    className="nodrag"
                    placeholder="Type something..."
                    ref={ref}
                />
            </div>
        )
    }
}