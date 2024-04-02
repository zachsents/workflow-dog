import type { WebDataTypeDefinition } from "@types"
import { Input } from "@web/components/ui/input"
import { TbBraces } from "react-icons/tb"
import type shared from "./shared"
import stringifyObject from "stringify-object"

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
                {stringifyObject(value, {
                    indent: "  ",
                })}
            </p>
        )
    },
    shouldExpand: () => true,
    renderExpanded: ({ value }) => {
        return (
            <p>
                {stringifyObject(value, {
                    indent: "  ",
                })}
            </p>
        )
    },
} satisfies WebDataTypeDefinition<typeof shared>