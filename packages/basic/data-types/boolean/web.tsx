import type { WebDataTypeDefinition } from "@types"
import { TbCheckbox } from "react-icons/tb"
import type shared from "./shared"
import { Switch } from "@web/components/ui/switch"

export default {
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
} satisfies WebDataTypeDefinition<typeof shared>