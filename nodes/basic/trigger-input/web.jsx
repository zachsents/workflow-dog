import { TbPlayerSkipForward } from "react-icons/tb"
import colors from "tailwindcss/colors"
import { useWorkflow } from "@web/modules/workflows"
import { object as triggerMap } from "triggers/web"

export default {
    icon: TbPlayerSkipForward,
    color: colors.gray[800],
    tags: ["Trigger", "Basic"],
    inputs: {
        input: {
            description: "The input to get from the trigger.",
            defaultMode: "config",
            allowedModes: ["config"],
            enumSettings: {
                useEnumValues: () => {
                    const { data: workflow } = useWorkflow()
                    const triggerDef = triggerMap[workflow?.trigger?.type]

                    const triggerInputs = Object.entries(triggerDef?.inputs ?? {}).map(([key, value]) => ({
                        id: key,
                        label: value.name,
                        type: value.type,
                    }))

                    return triggerInputs
                },
            },
            renderInBody: true,
        }
    },
    outputs: {
        value: {
        }
    },
}