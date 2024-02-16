import { Button, Input } from "@nextui-org/react"
import { TbMinus, TbNumbers, TbPlus } from "react-icons/tb"
import colors from "tailwindcss/colors"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"


export default {
    icon: TbNumbers,
    color: colors.gray[800],
    tags: ["Math", "Basic"],
    outputs: {
        number: {
            bullet: true,
        }
    },
    renderNode: ({ id }) => {

        const [value, _setValue] = useNodeProperty(id, "data.state.value")

        const setValue = newValue => _setValue(newValue.replaceAll(/[^0-9.,-]/g, ""))

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
            <div className="relative group">
                <div className="flex justify-center items-stretch py-unit-xs gap-1">
                    <div style={{
                        width: `${Math.max((value?.toString().length || 0) + 1, 2)}ch`
                    }}>
                        <Input
                            value={value ?? ""}
                            onValueChange={setValue}
                            size="sm" variant="bordered"
                            placeholder="0"
                            className="nodrag"
                            classNames={{
                                input: "text-center",
                                inputWrapper: "p-0 h-auto nodrag",
                            }}
                        />
                    </div>
                    <div className="flex flex-col items-stretch gap-1">
                        <Button
                            size="sm" variant="flat" className="min-w-0 px-1 h-auto flex-1 nodrag text-default-500 rounded-sm opacity-50 group-hover:opacity-100 transition-opacity"
                            onPress={increment}
                        >
                            <TbPlus />
                        </Button>
                        <Button
                            size="sm" variant="flat" className="min-w-0 px-1 h-auto flex-1 nodrag text-default-500 rounded-sm opacity-50 group-hover:opacity-100 transition-opacity"
                            onPress={decrement}
                        >
                            <TbMinus />
                        </Button>
                    </div>
                </div>

                <p className="absolute bottom-full text-tiny text-default-500 left-2">
                    Number
                </p>
            </div>
        )
    }
}


function parseNumber(str) {
    return parseFloat(str?.replaceAll(/[^0-9.-]/g, "") || 0)
}