import { } from "@web/modules/workflow-editor/graph/nodes"
import { TbReplace } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    name: "Fill Text Template",
    icon: TbReplace,
    color: colors.gray[800],
    tags: ["Text"],
    // renderBody: () => {
    //     const nodeId = useNodeId()
    //     const template = useStore(s => s.nodeInternals.get(nodeId).data.inputs.find(i => i.definition === "template"), _.isEqual)
    //     return template.mode === "config" &&
    //         <p className="text-default-500 text-xs line-clamp-3">
    //             {template.value}
    //         </p>
    // },
    inputs: {
        template: {
            description: "The template to insert values into. Use {SubstitutionName} to insert a value.",
            defaultMode: "handle",
            allowedModes: ["handle"],
            stringSettings: {
                long: true,
            },
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
            defaultMode: "handle",
            allowedModes: ["handle"],
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