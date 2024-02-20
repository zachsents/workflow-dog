import { Select, SelectItem } from "@nextui-org/react"
import { useControlledSelectedKeys } from "@web/modules/util"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { TbRobot } from "react-icons/tb"
import colors from "tailwindcss/colors"


const models = [
    { id: "gpt-3.5-turbo" },
    { id: "gpt-4" },
]

export default {
    icon: TbRobot,
    color: colors.neutral[800],
    tags: ["ChatGPT", "AI"],

    renderBody: () => {

        const [model, setModel] = useNodeProperty(undefined, "data.state.model", {
            defaultValue: "gpt-3.5-turbo",
        })
        const { selectedKeys, onSelectionChange } = useControlledSelectedKeys(model, setModel)

        return (
            <Select
                selectedKeys={selectedKeys}
                onSelectionChange={onSelectionChange}
                selectionMode="single"
                disallowEmptySelection
                size="sm"
                label="Model" labelPlacement="outside"
                classNames={{
                    mainWrapper: "min-w-[10rem]"
                }}
                items={models}
            >
                {model =>
                    <SelectItem key={model.id} value={model.id} >
                        {model.id}
                    </SelectItem>}
            </Select>
        )
    },
}