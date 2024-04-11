import { Checkbox } from "@ui/checkbox"
import { Label } from "@ui/label"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"

export default function OrEqualOption({ id }: { id: string }) {

    const [orEqual, setOrEqual] = useNodeProperty(undefined, "data.state.orEqual", {
        defaultValue: false,
    })

    return (
        <div className="flex center gap-2 mt-1">
            <Checkbox
                id={`${id}-or-equal`}
                checked={orEqual}
                onCheckedChange={setOrEqual}
            />
            <Label htmlFor={`${id}-or-equal`}>
                or equal to
            </Label>
        </div>
    )
}