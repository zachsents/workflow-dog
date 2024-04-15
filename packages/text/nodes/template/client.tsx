import { createClientNodeDefinition } from "@pkg/types"
import { TbReplace } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbReplace,
    color: "#4b5563",
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
})
