// math/sin/web.jsx
import { Select, SelectItem } from "@nextui-org/react"
import { useControlledSelectedKeys } from "@web/modules/util"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { TbWaveSine } from "react-icons/tb"
import colors from "tailwindcss/colors"


export default {
    icon: TbWaveSine,
    color: colors.gray[800],
    tags: ["Math", "Trigonometry"],
    inputs: {
        angle: {},
    },
    outputs: {
        sine: {},
    },
    renderBody: () => {

        const [angleMode, setAngleMode] = useNodeProperty(undefined, "data.state.angleMode", {
            defaultValue: "degrees",
        })
        const { selectedKeys, onSelectionChange } = useControlledSelectedKeys(angleMode, setAngleMode)

        return (
            <Select
                selectedKeys={selectedKeys}
                onSelectionChange={onSelectionChange}
                selectionMode="single"
                disallowEmptySelection
                size="sm"
                label="Angle Units" labelPlacement="outside"
                classNames={{
                    mainWrapper: "min-w-[8rem]"
                }}
            >
                <SelectItem key="degrees" value="degrees" >
                    Degrees
                </SelectItem>
                <SelectItem key="radians" value="radians" >
                    Radians
                </SelectItem>
            </Select>
        )
    },
}
