import { createClientDataTypeDefinition } from "@pkg/types"
import { Textarea } from "@web/components/ui/textarea"
import { cn } from "@web/lib/utils"
import { TbAbc } from "react-icons/tb"
import shared from "./shared"

export default createClientDataTypeDefinition(shared, {
    icon: TbAbc,
    manualInputComponent: (props: any) => {
        return (
            <Textarea
                placeholder="Enter text..."
                {...props}
                className={cn("resize-none", props.className)}
                value={props.value || ""}
            />
        )
    },
})