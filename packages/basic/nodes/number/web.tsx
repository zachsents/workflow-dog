import { TbMinus, TbNumbers, TbPlus } from "react-icons/tb"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { WebNodeDefinition } from "@types"
import type shared from "./shared"
import { Input } from "@web/components/ui/input"
import { Button } from "@web/components/ui/button"


export default {
    icon: TbNumbers,
    color: "#1f2937",
    tags: ["Math", "Basic"],
    inputs: {},
    outputs: {
        number: {
            bullet: true
        }
    },
    renderBody: ({ id }) => {

        const [value, _setValue] = useNodeProperty(id, "data.state.value")
        const setValue = (newValue: string) => _setValue(newValue.replaceAll(/[^0-9.,-]/g, ""))

        const increment = () => {
            const newValue = parseNumber(value) + 1
            if (!isNaN(newValue))
                setValue(newValue.toString())
        }

        const decrement = () => {
            const newValue = parseNumber(value) - 1
            if (!isNaN(newValue))
                setValue(newValue.toString())
        }

        return (
            <div className="self-stretch flex items-stretch gap-1">
                <Input
                    value={value ?? ""}
                    onChange={ev => setValue(ev.currentTarget.value)}
                    placeholder="0"
                    className="nodrag nopan text-center shadow-none w-24"
                />

                <div
                    className="shrink-0 flex-v items-stretch"
                    onClick={ev => ev.stopPropagation()}
                >
                    <Button
                        size="sm" variant="ghost" className="px-2 h-auto flex-1"
                        onClick={increment}
                    >
                        <TbPlus />
                    </Button>
                    <Button
                        size="sm" variant="ghost" className="px-2 h-auto flex-1"
                        onClick={decrement}
                    >
                        <TbMinus />
                    </Button>
                </div>
            </div>
        )
    }
} satisfies WebNodeDefinition<typeof shared>


function parseNumber(str?: string) {
    return parseFloat(str?.replaceAll(/[^0-9.-]/g, "") || "0")
}
