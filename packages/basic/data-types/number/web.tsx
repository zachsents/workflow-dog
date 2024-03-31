import type { WebDataTypeDefinition } from "@types"
import { TbNumbers } from "react-icons/tb"
import type shared from "./shared"
import { Input } from "@web/components/ui/input"

export default {
    icon: TbNumbers,
    manualInputComponent: props => {
        return (
            <Input
                {...props}
                type="number"
                placeholder="Enter a number..."
                value={props.value || ""}
            />
        )
    },
} satisfies WebDataTypeDefinition<typeof shared>