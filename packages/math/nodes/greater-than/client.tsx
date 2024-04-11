import { createClientNodeDefinition } from "@pkg/types"
import { Checkbox } from "@web/components/ui/checkbox"
import { Label } from "@web/components/ui/label"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { TbMathGreater } from "react-icons/tb"
import shared from "./shared"

export default createClientNodeDefinition(shared, {
    icon: TbMathGreater,
    color: "#4b5563",
    tags: ["Math", "Comparison"],
    inputs: {
        a: {},
        b: {},
    },
    outputs: {
        result: {},
    },
    renderBody: ({ id }) => {
        const [orEqual, setOrEqual] = useNodeProperty(undefined, "data.state.orEqual")

        return (
            <div className="flex items-center gap-2">
                <Checkbox
                    id={`${id}-or-equal`}
                    checked={orEqual || false}
                    onCheckedChange={setOrEqual}
                />
                <Label htmlFor={`${id}-or-equal`}>
                    or equal to
                </Label>
            </div>
        )
    },
})
