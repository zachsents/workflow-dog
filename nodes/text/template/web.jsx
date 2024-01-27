import { } from "@web/modules/workflow-editor/graph/nodes"
import { TbReplace } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    name: "Fill Text Template",
    icon: TbReplace,
    color: colors.gray[800],
    tags: ["Text"],
    inputs: {
        template: {
            description: "The template to insert values into. Use {SubstitutionName} to insert a value.",
            deriveInputs: (value) => ({
                substitution: {
                    keyBy: "name",
                    inputs: [...new Set(value?.match(/(?<={).+?(?=})/g))].map(name => ({
                        name,
                    }))
                }
            }),
            recommendedNode: {
                data: {
                    definition: "node-type:basic.text",
                    name: "Template Text",
                    comment: "A template to insert values into. Use {SubstitutionName} to insert a value.",
                },
                handle: "text",
            },
        },
        substitution: {
            name: "Substitutions",
            description: "A value to insert into the template. If your template contains {FirstName}, a substitution named FirstName will replace it.",
            named: true,
            derivedFrom: "template",
        },
    },
    outputs: {
        text: {
            description: "The result of the template with all substitutions inserted.",
        },
    }
}