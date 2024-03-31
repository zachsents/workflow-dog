import type { WebDataTypeDefinition } from "@types"
import { TbBraces } from "react-icons/tb"
import type shared from "./shared"
import { Input } from "@web/components/ui/input"

export default {
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
} satisfies WebDataTypeDefinition<typeof shared>