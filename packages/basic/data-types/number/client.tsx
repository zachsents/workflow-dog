import { createClientDataTypeDefinition } from "@pkg/types"
import { TbNumbers } from "react-icons/tb"
import shared from "./shared"
import { Input } from "@web/components/ui/input"

export default createClientDataTypeDefinition(shared, {
    icon: TbNumbers,
    manualInputComponent: ({ ...props }) => {
        return (
            <Input
                {...props as any}
                type="number"
                placeholder="Enter a number..."
                value={props.value || ""}
            />
        )
    },
    renderPreview: ({ value }) => {
        const formatted = new Intl.NumberFormat().format(value)
        return (
            <p className="font-bold">
                {formatted}
            </p>
        )
    },
    shouldExpand: () => false,
})