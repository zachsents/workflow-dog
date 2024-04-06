import { createClientDataTypeDefinition } from "@pkg/types"
import { cn } from "@web/lib/utils"
import { TbMessages } from "react-icons/tb"
import shared from "./shared"

export default createClientDataTypeDefinition(shared, {
    icon: TbMessages,
    renderPreview: ({ value }) => {
        return (
            <p>
                {Object.values(value).filter(Boolean).length} flagged
            </p>
        )
    },
    renderExpanded: ({ value }) => {
        return (
            <table>
                <tbody>
                    {Object.entries(value).map(([category, flagged]) =>
                        <tr className="[&>td]:py-2" key={category}>
                            <td className="pr-4 w-[0%] capitalize">
                                {category}
                            </td>
                            <td className={cn(flagged ? "text-red-600 font-bold" : "text-muted-foreground")}>
                                {flagged ? "Flagged" : "Not flagged"}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        )
    },
})
