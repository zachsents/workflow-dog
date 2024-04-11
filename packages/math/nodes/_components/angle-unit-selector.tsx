import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ui/select"

export default function AngleUnitSelector() {
    const [angleMode, setAngleMode] = useNodeProperty(undefined, "data.state.angleMode", {
        defaultValue: "degrees",
    })

    return (
        <div className="mt-1 self-stretch">
            <p className="text-xs font-medium text-left">Unit</p>
            <Select
                value={angleMode}
                onValueChange={setAngleMode}
            >
                <SelectTrigger>
                    <SelectValue placeholder="Angle Units" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="degrees">
                        Degrees
                    </SelectItem>
                    <SelectItem value="radians">
                        Radians
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    )
}