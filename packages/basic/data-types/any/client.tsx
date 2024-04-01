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
    renderPreview: ({ value }) => {
        return (
            <p className="line-clamp-2">
                {value?.toString() ?? value}
            </p>
        )
    },
    shouldExpand: () => true,
    renderExpanded: ({ value }) => {
        return (
            <p>
                {value?.toString() ?? value}
            </p>
        )
    },
} satisfies WebDataTypeDefinition<typeof shared>