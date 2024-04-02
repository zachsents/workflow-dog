import type { WebNodeDefinition } from "@types"
import { TbReplace } from "react-icons/tb"
import type shared from "./shared"

export default {
    icon: TbReplace,
    color: "#1f2937",
    tags: ["Basic", "Text"],
    inputs: {
        template: {
            description: "The template string. Wrap variables in curly braces, e.g. Hello, {name}!",
            recommendedNode: {
                definition: "https://nodes.workflow.dog/basic/text",
                handle: "text",
            },
        },
        substitutions: {
            recommendedNode: {
                definition: "https://nodes.workflow.dog/basic/text",
                handle: "text",
            },
        },
    },
    outputs: {
        result: {},
    },
} satisfies WebNodeDefinition<typeof shared>
