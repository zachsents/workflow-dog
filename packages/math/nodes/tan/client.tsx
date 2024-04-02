import type { WebNodeDefinition } from "@types"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ui/select"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { TbWaveSine } from "react-icons/tb"
import type shared from "./shared"


export default {
    icon: TbWaveSine,
    color: "#1f2937",
    tags: ["Math"],
    inputs: {
        angle: {},
    },
    outputs: {
        tangent: {},
    },
    renderBody: () => {
        const [angleMode, setAngleMode] = useNodeProperty(undefined, "data.state.angleMode", {
            defaultValue: "degrees",
        })

        return (
            <Select defaultValue={angleMode} onValueChange={setAngleMode}>
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
        )
    },
} satisfies WebNodeDefinition<typeof shared>
