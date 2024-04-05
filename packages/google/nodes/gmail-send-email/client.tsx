import { createClientNodeDefinition } from "@pkg/types"
import { TbBrandGmail } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbBrandGmail,
    color: "#ea4335",
    tags: ["Gmail", "Email"],
    inputs: {
        to: {},
        subject: {},
        message: {},
    },
    outputs: {},
})
