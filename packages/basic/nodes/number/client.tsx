import { createClientNodeDefinition } from "@pkg/types"
import { Button } from "@web/components/ui/button"
import { Input } from "@web/components/ui/input"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { TbMinus, TbNumbers, TbPlus } from "react-icons/tb"
import shared from "./shared"


export default createClientNodeDefinition(shared, {
    icon: TbNumbers,
    color: "#4b5563",
    tags: ["Math", "Basic"],
    inputs: {},
    outputs: {
        number: {}
    },
    renderBody: ({ id }) => {

        const [value, _setValue] = useNodeProperty(id, "data.state.value", {
            defaultValue: "",
        })
        const setValue = (newValue: string) => _setValue(cleanNumberValue(newValue))

        const changeValueBy = (amount: number) => () => {
            const newValue = parseNumber(value) + amount
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
                        onClick={changeValueBy(1)}
                    >
                        <TbPlus />
                    </Button>
                    <Button
                        size="sm" variant="ghost" className="px-2 h-auto flex-1"
                        onClick={changeValueBy(-1)}
                    >
                        <TbMinus />
                    </Button>
                </div>
            </div>
        )
    }
})


function cleanNumberValue(str: string) {
    return str.replaceAll(/[^0-9.,-]/g, "")
}

function parseNumber(str?: string) {
    return parseFloat(str?.replaceAll(/[^0-9.-]/g, "") || "0")
}
