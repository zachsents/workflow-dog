import { createClientDataTypeDefinition } from "@pkg/types"
import shared from "./shared"
import { TbArrowRight, TbTriangleSquareCircle } from "react-icons/tb"
import { Textarea } from "@web/components/ui/textarea"
import { cn } from "@web/lib/utils"
import stringifyObject from "stringify-object"

export default createClientDataTypeDefinition(shared, {
    icon: TbTriangleSquareCircle,
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
            <p className="line-clamp-2">
                {Object.keys(value).slice(0, 3).map(key =>
                    <span className="flex center gap-1" key={key}>
                        <span>{key}</span>
                        <TbArrowRight />
                        <span>...</span>
                    </span>
                )}
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