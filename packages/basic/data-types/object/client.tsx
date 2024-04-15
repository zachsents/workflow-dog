import { createClientDataTypeDefinition } from "@pkg/types"
import { Textarea } from "@web/components/ui/textarea"
import { cn } from "@web/lib/utils"
import { TbArrowRight, TbTriangleSquareCircle } from "react-icons/tb"
import stringifyObject from "stringify-object"
import shared from "./shared"

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
        const keys = Object.keys(value)
        return (
            <p className="line-clamp-2">
                {keys.length > 0
                    ? keys.slice(0, 3).map(key =>
                        <span className="flex center gap-1" key={key}>
                            <span>{key}</span>
                            <TbArrowRight />
                            <span>...</span>
                        </span>
                    )
                    : <span className="text-muted-foreground">
                        Empty object
                    </span>}
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