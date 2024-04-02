import { TbPlus } from "react-icons/tb"
import type shared from "./shared"
import { WebNodeDefinition } from "@types"


export default {
    icon: TbPlus,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        addends: {},
    },
    outputs: {
        sum: {},
    },
} satisfies WebNodeDefinition<typeof shared>