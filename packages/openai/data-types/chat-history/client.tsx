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
            <table>
                <tbody>
                    {value.map((message, i) =>
                        <tr className="[&>td]:py-2" key={i}>
                            <td className="text-muted-foreground pr-4 w-[0%] capitalize ">
                                <p className="bg-slate-50 border rounded-md text-center px-2 text-sm">
                                    {message.role}
                                </p>
                            </td>
                            <td>
                                {!!message.content
                                    ? typeof message.content === "string"
                                        ? message.content
                                        : message.content.map((content, i) =>
                                            content.type === "text"
                                                ? <p key={i}>{content.text}</p>
                                                : content.type === "image_url"
                                                    ? <img
                                                        key={i}
                                                        src={content.image_url.url}
                                                        className="h-32 rounded-md"
                                                    />
                                                    : null
                                        )
                                    : null}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        )
    },
})
