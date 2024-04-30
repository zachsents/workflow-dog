import { createClientDataTypeDefinition } from "@pkg/types"
import { Input } from "@web/components/ui/input"
import { TbBraces } from "react-icons/tb"
import shared from "./shared"

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
})