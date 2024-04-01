import type { WebDataTypeDefinition } from "@types"
import type shared from "./shared"
import { TbTriangleSquareCircle } from "react-icons/tb"
import { Textarea } from "@web/components/ui/textarea"
import { cn } from "@web/lib/utils"

export default {
    icon: TbTriangleSquareCircle,
    manualInputComponent: ({ value, ...props }: any) => {
        // TODO: add intermediate value for converting between object
        // and string representations. maybe do the conversion on blur
        // or just make it one-way

        return (
            <Textarea
                {...props}
                className={cn("resize-none font-mono", props.className)}
                placeholder="Enter JSON data here..."
                value={value || ""}
            />
        )
    },
} satisfies WebDataTypeDefinition<typeof shared>