import { createClientNodeDefinition } from "@pkg/types"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ui/select"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { TbRobot } from "react-icons/tb"
import shared from "./shared"


const voices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]


export default createClientNodeDefinition(shared, {
    icon: TbRobot,
    color: "#000000",
    badge: "OpenAI",
    tags: ["ChatGPT", "OpenAI", "AI", "Whisper"],
    inputs: {
        text: {
            recommendedNode: {
                definition: "https://nodes.workflow.dog/basic/text",
                handle: "text",
            }
        },
    },
    outputs: {
        audio: {},
    },
    renderBody: () => {
        const [voice, setVoice] = useNodeProperty(undefined, "data.state.voice")
        return (
            <div className="mt-1 self-stretch">
                <p className="text-xs font-medium text-left">Voice</p>
                <Select onValueChange={setVoice} defaultValue={voice || "alloy"}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pick one..." />
                    </SelectTrigger>
                    <SelectContent>
                        {voices.map(voice =>
                            <SelectItem value={voice} key={voice}>
                                {voice}
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>
        )
    },
})
