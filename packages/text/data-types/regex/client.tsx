import { createClientDataTypeDefinition } from "@pkg/types"
import { TbRegex } from "react-icons/tb"
import shared from "./shared"

export default createClientDataTypeDefinition(shared, {
    icon: TbRegex,
    renderPreview: ({ value }) => {
        return (
            <p className="line-clamp-1 font-mono">
                <span className="text-muted-foreground">/</span>
                <span>{value.pattern}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">{value.flags}</span>
            </p>
        )
    },
})