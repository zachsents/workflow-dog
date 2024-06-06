import { clientTypeMeta } from "@pkg/helpers/client"
import "@pkg/types/client"
import { Input } from "@web/components/ui/input"
import { TbBraces } from "react-icons/tb"
import shared from "./any.shared"

export default clientTypeMeta(shared, {
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