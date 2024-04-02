import type { WebDataTypeDefinition } from "@types"
import { Textarea } from "@web/components/ui/textarea"
import { cn } from "@web/lib/utils"
import _ from "lodash"
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
            // WIP
            // <div className="flex-v items-stretch gap-4">
            //     <Select>
            //         <SelectTrigger className="self-end w-[200px]">
            //             <SelectValue placeholder="Style" />
            //         </SelectTrigger>
            //         <SelectContent>
            //             <SelectItem value="pretty">
            //                 Pretty
            //             </SelectItem>
            //             <SelectItem value="raw">
            //                 Raw
            //             </SelectItem>
            //         </SelectContent>
            //     </Select>

            //     {Object.entries(prettyObj(value)).map(([key, value]) =>
            //         <div className="flex between gap-4 flex-nowrap" key={key}>
            //             <p>{key}</p>
            //             <Separator orientation="vertical" />
            //             <div className="flex-1" />
            //             <pre>{value}</pre>
            //         </div>
            //     )}
            // </div>

            <pre>
                {stringifyObject(value, {
                    indent: "  ",
                })}
            </pre>
        )
    },
} satisfies WebDataTypeDefinition<typeof shared>



/**
 * WIP
 */
function prettyObj(obj: object) {
    return _.mapValues(_.mapKeys(obj, (v, k) => {
        if (/[^a-z0-9_]/.test(k))
            return k

        return k.replaceAll("_", " ").replaceAll(/(?<!\S)[a-z]/g, (m) => m.toUpperCase())
    }), (v) => stringifyObject(v, {
        indent: "  ",
    }))
}