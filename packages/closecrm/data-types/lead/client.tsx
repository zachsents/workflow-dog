import type { WebDataTypeDefinition } from "@types"
import { Textarea } from "@web/components/ui/textarea"
import { cn } from "@web/lib/utils"
import { TbUser } from "react-icons/tb"
import stringifyObject from "stringify-object"
import type shared from "./shared"

export default {
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
    renderPreview: ({ value }) => {
        return (
            <p>
                <span className="text-muted-foreground">[Lead]</span>
                {" "}{value.name}
            </p>
        )
    },
    shouldExpand: () => true,
    renderExpanded: ({ value }) => {
        return (
            <pre>
                {stringifyObject(value, {
                    indent: "  ",
                })}
            </pre>
        )
    },
} satisfies WebDataTypeDefinition<typeof shared>