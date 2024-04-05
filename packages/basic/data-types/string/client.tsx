import { createClientDataTypeDefinition } from "@pkg/types"
import { TbAbc } from "react-icons/tb"
import shared from "./shared"
import { Textarea } from "@web/components/ui/textarea"
import { cn } from "@web/lib/utils"

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
    renderPreview: ({ value }) => {
        return (
            <p>
                {value || <span className="text-muted-foreground">&lt;no text&gt;</span>}
            </p>
        )
    },
})