import { clientNode } from "@pkg/helpers/client"
import "@pkg/types/client"
import { Switch } from "@web/components/ui/switch"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { TbCircuitSwitchOpen } from "react-icons/tb"
import shared from "./boolean.shared"

export default clientNode(shared, {
    icon: TbCircuitSwitchOpen,
    color: "#4b5563",
    tags: ["Logic", "Basic"],
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