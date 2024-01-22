import { TbReplace } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: TbReplace,
    color: colors.gray[800],
    tags: ["Text"],
    renderBody: () => {

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