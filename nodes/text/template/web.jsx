import { TbReplace } from "react-icons/tb"
import colors from "tailwindcss/colors"
import { } from "@web/modules/workflow-editor/graph/nodes"
import { useStore, useNodeId } from "reactflow"
import _ from "lodash"

export default {
    icon: TbReplace,
    color: colors.gray[800],
    tags: ["Text"],
    renderBody: () => {
        const nodeId = useNodeId()
        const template = useStore(s => s.nodeInternals.get(nodeId).data.inputs.find(i => i.definition === "template").value, _.isEqual)
        return (
            <p className="text-default-500 text-xs line-clamp-3">
                {template}
            </p>
        )
    },
    inputs: {
        template: {
            description: "The template to insert values into. Use {SubstitutionName} to insert a value.",
            defaultMode: "config",
            allowedModes: ["config", "handle"],
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
            })
        },
        substitution: {
            name: "Substitutions",
            description: "A value to insert into the template. If your template contains {FirstName}, a substitution named FirstName will replace it.",
            defaultMode: "handle",
            allowedModes: ["handle", "config"],
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