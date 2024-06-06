import { clientTypeMeta } from "@pkg/helpers/client"
import "@pkg/types/client"
import { Switch } from "@web/components/ui/switch"
import { cn } from "@web/lib/utils"
import { TbCheckbox } from "react-icons/tb"
import shared from "./boolean.shared"

export default clientTypeMeta(shared, {
    icon: TbCheckbox,

    manualInputComponent: ({ value, onChange, ...props }) =>
        <div className="block px-2">
            <Switch
                {...props as any}
                checked={value || false}
                onCheckedChange={onChange}
            />
        </div>,

    renderPreview: ({ value }) =>
        <p className={cn(
            "font-bold text-center",
            value ? "text-green-300" : "text-red-300",
        )}>
            {value ? "true" : "false"}
        </p>,
})