import { createClientDataTypeDefinition } from "@pkg/types"
import { Input } from "@web/components/ui/input"
import { TbCalendar } from "react-icons/tb"
import shared from "./shared"

export default createClientDataTypeDefinition(shared, {
    icon: TbCalendar,
    manualInputComponent: (props: any) => {
        return (
            <Input
                {...props as any}
                type="datetime-local"
                placeholder="Enter a date..."
                value={props.value || ""}
            />
        )
    },
    renderPreview: ({ value }) => {
        return (
            <p>
                {new Date(value).toLocaleString()}
            </p>
        )
    },
})