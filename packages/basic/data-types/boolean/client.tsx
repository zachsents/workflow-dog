import { createClientDataTypeDefinition } from "@pkg/types"
import { TbCheckbox } from "react-icons/tb"
import shared from "./shared"
import { Switch } from "@web/components/ui/switch"
import { cn } from "@web/lib/utils"

export default createClientDataTypeDefinition(shared, {
    icon: TbCheckbox,
    manualInputComponent: ({ value, onChange, ...props }) => {
        return (
            <div className="block px-2">
                <Switch
                    {...props as any}
                    checked={value || false}
                    onCheckedChange={onChange}
                />
            </div>
        )
    },
    renderPreview: ({ value }) => {
        return (
            <p className={cn(
                "font-bold text-center",
                value ? "text-green-300" : "text-red-300",
            )}>
                {value ? "true" : "false"}
            </p>
        )
    },
})