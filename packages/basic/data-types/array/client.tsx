import { createClientDataTypeDefinition } from "@pkg/types"
import { Textarea } from "@web/components/ui/textarea"
import { cn } from "@web/lib/utils"
import { TbBracketsContain } from "react-icons/tb"
import stringifyObject from "stringify-object"
import shared from "./shared"

export default createClientDataTypeDefinition(shared, {
    icon: TbBracketsContain,
    manualInputComponent: ({ value, ...props }: any) => {
        // TODO: add intermediate value for converting between object
        // and string representations. maybe do the conversion on blur
        // or just make it one-way

        return (
            <Textarea
                {...props}
                className={cn("resize-none font-mono", props.className)}
                placeholder="Enter JSON data here..."
                value={value || ""}
            />
        )
    },
    renderPreview: ({ value }) => {
        return (
            <p>
                List - {value.length} items
            </p>
        )
    },
    renderExpanded: ({ value }) => {
        return (
            <pre>
                {stringifyObject(value, {
                    indent: "  ",
                })}
            </pre>
        )
    },
})