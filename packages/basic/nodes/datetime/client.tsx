import { createClientNodeDefinition } from "@pkg/types"
import { Input } from "@web/components/ui/input"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { TbCalendar } from "react-icons/tb"
import shared from "./shared"


export default createClientNodeDefinition(shared, {
    icon: TbCalendar,
    color: "#4b5563",
    tags: ["Basic", "Date", "Time"],
    inputs: {},
    outputs: {
        datetime: {},
    },
    renderBody: ({ id }) => {

        const [value, setValue] = useNodeProperty(id, "data.state.value", {
            defaultValue: "",
        })

        return (
            <Input
                value={value ?? ""}
                onChange={ev => setValue(ev.currentTarget.value)}
                type="datetime-local"
                className="nodrag nopan shadow-none w-72"
            />
        )
    }
})
