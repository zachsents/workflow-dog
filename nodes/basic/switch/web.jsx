import { Switch } from "@nextui-org/react"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { TbCircuitSwitchOpen } from "react-icons/tb"
import colors from "tailwindcss/colors"


export default {
    icon: TbCircuitSwitchOpen,
    color: colors.gray[800],
    tags: ["Logic", "Basic"],
    outputs: {
        enabled: {
            bullet: true,
        }
    },
    renderNode: () => {
        const [value, setValue] = useNodeProperty(undefined, "data.state.value")

        return (
            <div className="relative">
                <Switch 
                    size="sm" 
                    isSelected={value || false}
                    onValueChange={setValue}
                    className="nodrag my-unit-sm"
                />
                <p className="absolute bottom-full text-tiny text-default-500 left-2">
                    Switch
                </p>
            </div>
        )
    },
}