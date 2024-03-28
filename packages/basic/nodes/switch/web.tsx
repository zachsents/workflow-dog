import { WebNodeDefinition } from "@types"
import { Switch } from "@web/components/ui/switch"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { TbCircuitSwitchOpen } from "react-icons/tb"
import type shared from "./shared"


export default {
    icon: TbCircuitSwitchOpen,
    color: "#1f2937",
    tags: ["Logic", "Basic"],
    inputs: {},
    outputs: {
        enabled: {}
    },
    renderBody: () => {
        const [value, setValue] = useNodeProperty(undefined, "data.state.value")

        return (
            <div className="nodrag nopan" onClick={ev => ev.stopPropagation()}>
                <Switch
                    checked={value || false}
                    onCheckedChange={setValue}
                />
            </div>
        )
    },
} satisfies WebNodeDefinition<typeof shared>