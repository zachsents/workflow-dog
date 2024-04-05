import { createClientDataTypeDefinition } from "@pkg/types"
import { TbMessages } from "react-icons/tb"
import shared from "./shared"

export default createClientDataTypeDefinition(shared, {
    icon: TbMessages,
    renderPreview: ({ value }) => {
        return (
            <p>
                <span className="text-muted-foreground">[Chat]</span>
                {" "}{value.length} messages
            </p>
        )
    },
    renderExpanded: ({ value }) => {
        return (
            <table className="">
                {value.map((message, i) =>
                    <tr className="[&>td]:py-2" key={i}>
                        <td className="text-muted-foreground pr-4 w-[0%] capitalize ">
                            <p className="bg-slate-50 border rounded-md text-center px-2 text-sm">
                                {message.role}
                            </p>
                        </td>
                        <td>
                            {message.content}
                        </td>
                    </tr>
                )}
            </table>
        )
    },
})
