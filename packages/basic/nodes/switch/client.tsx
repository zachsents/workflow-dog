import { createClientNodeDefinition } from "@pkg/types"
import { Switch } from "@web/components/ui/switch"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { TbCircuitSwitchOpen } from "react-icons/tb"
import shared from "./shared"


export default createClientNodeDefinition(shared, {
    icon: TbCircuitSwitchOpen,
    color: "#4b5563",
    tags: ["Logic", "Basic"],
    inputs: {},
    outputs: {
        enabled: {}
    },
    renderBody: () => {
        const [value, setValue] = useNodeProperty(undefined, "data.state.value", {
            defaultValue: false
        })

        return (
            <div
                className="nodrag nopan pt-1"
                onClick={ev => ev.stopPropagation()}
            >
                <Switch
                    checked={value || false}
                    onCheckedChange={setValue}
                />
            </div>
        )
    },
})