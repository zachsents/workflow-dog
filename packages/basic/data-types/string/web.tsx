import type { WebDataTypeDefinition } from "@types"
import { TbAbc } from "react-icons/tb"
import type shared from "./shared"
import { Textarea } from "@web/components/ui/textarea"
import { cn } from "@web/lib/utils"

export default {
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
            <p className="line-clamp-2">
                {value}
            </p>
        )
    },
    shouldExpand: (value) => value.length > 100,
    renderExpanded: ({ value }) => {
        return (
            <p>
                {value}
            </p>
        )
    },
} satisfies WebDataTypeDefinition<typeof shared>