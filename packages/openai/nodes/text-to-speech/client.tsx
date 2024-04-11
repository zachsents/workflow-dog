import { createClientNodeDefinition } from "@pkg/types"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ui/select"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { TbBrandOpenai } from "react-icons/tb"
import shared from "./shared"


const voices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]


export default createClientNodeDefinition(shared, {
    icon: TbBrandOpenai,
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
        const [voice, setVoice] = useNodeProperty(undefined, "data.state.voice", {
            defaultValue: "alloy",
        })
        return (
            <div className="mt-1 self-stretch">
                <p className="text-xs font-medium text-left">
                    Voice
                </p>
                <Select
                    value={voice}
                    onValueChange={setVoice}
                >
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
