import { createClientDataTypeDefinition } from "@pkg/types"
import { Input } from "@web/components/ui/input"
import { TbBraces } from "react-icons/tb"
import shared from "./shared"
import stringifyObject from "stringify-object"
import ObjectViewer from "@web/components/object-viewer"

export default createClientDataTypeDefinition(shared, {
    icon: TbBraces,
    manualInputComponent: props => {
        return (
            <Input
                {...props}
                value={props.value || ""}
                placeholder="Enter data here..."
            />
        )
    },
    renderPreview: ({ value }) => {
        if (value == null)
            return <span className="text-muted-foreground">null</span>

        if (typeof value === "object")
            return Array.isArray(value)
                ? `Array - ${value.length} items`
                : `Object - ${Object.keys(value).length} properties`

        return (
            <p className="whitespace-pre-wrap">
                {value}
            </p>
        )
    },
    renderExpanded: ({ value }) => {
        if (typeof value === "object" && value != null)
            return <ObjectViewer>{value}</ObjectViewer>

        return (
            <pre className="whitespace-pre-wrap break-all">
                {stringifyObject(value, {
                    indent: "  ",
                })}
            </pre>
        )
    }
})