import { Button, Input } from "@nextui-org/react"
import { TbMinus, TbNumbers, TbPlus } from "react-icons/tb"
import colors from "tailwindcss/colors"
import { useNodeProperty } from "../../_private/util"


export default {
    icon: TbNumbers,
    color: colors.gray[800],
    tags: ["Math", "Basic"],
    outputs: {
        number: {
            bullet: true,
        }
    },
    renderBody: ({ id }) => {

        const [value, _setValue] = useNodeProperty(id, "data.state.value")

        const setValue = newValue => _setValue(newValue.replaceAll(/[^0-9.,-]/g, ""))

        const increment = () => {
            const newValue = parseNumber(value) + 1
            if (!isNaN(newValue)) setValue(newValue.toString())
        }

        const decrement = () => {
            const newValue = parseNumber(value) - 1
            if (!isNaN(newValue)) setValue(newValue.toString())
        }

        return (
            <div className="flex justify-center items-stretch py-unit-xs gap-2">
                <div className="text-4xl" style={{
                    width: `${Math.max((value?.toString().length || 0) + 1, 2)}ch`
                }}>
                    <Input
                        value={value ?? ""}
                        onValueChange={setValue}
                        size="lg"
                        placeholder="0"
                        classNames={{
                            input: "text-center text-4xl",
                            inputWrapper: "p-2 nodrag",
                        }}
                    />
                </div>
                <div className="flex flex-col items-stretch gap-1">
                    <Button
                        size="sm" variant="flat" className="min-w-0 px-2 h-auto flex-1 nodrag"
                        onPress={increment}
                    >
                        <TbPlus />
                    </Button>
                    <Button
                        size="sm" variant="flat" className="min-w-0 px-2 h-auto flex-1 nodrag"
                        onPress={decrement}
                    >
                        <TbMinus />
                    </Button>
                </div>
            </div>
        )
    },
}


function parseNumber(str) {
    return parseFloat(str?.replaceAll(/[^0-9.-]/g, "") || 0)
}