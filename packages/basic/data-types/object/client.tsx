import { createClientDataTypeDefinition } from "@pkg/types"
import ObjectViewer from "@web/components/object-viewer"
import { Textarea } from "@web/components/ui/textarea"
import { cn } from "@web/lib/utils"
import { TbArrowRight, TbTriangleSquareCircle } from "react-icons/tb"
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
        return (
            <p>
                {`Object - ${Object.keys(value).length} properties`}
            </p>
        )
    },
    renderExpanded: ({ value }) => <ObjectViewer>{value}</ObjectViewer>,
})