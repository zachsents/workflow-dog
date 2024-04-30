import { createClientDataTypeDefinition } from "@pkg/types"
import { Textarea } from "@web/components/ui/textarea"
import { cn } from "@web/lib/utils"
import { TbUser } from "react-icons/tb"
import shared from "./shared"

export default createClientDataTypeDefinition(shared, {
    icon: TbUser,
    manualInputComponent: ({ value, ...props }: any) => {
        return (
            <Textarea
                {...props}
                className={cn("resize-none font-mono", props.className)}
                placeholder="Enter JSON data here..."
                value={value || ""}
            />
        )
    },
    renderPreview: ({ value }) => (
        <p>
            <span className="text-muted-foreground">[Contact]</span>
            {" "}{value.name}
        </p>
    ),
    useNativeExpanded: true,
})

