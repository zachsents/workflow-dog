// objects/merge/web.jsx
import { Checkbox } from "@nextui-org/react"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { TbArrowsJoin2 } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: TbArrowsJoin2,
    color: colors.gray[800],
    tags: ["Objects"],
    inputs: {
        objects: {},
    },
    outputs: {
        mergedObject: {},
    },
    renderBody: () => {
        const [deep, setDeep] = useNodeProperty(undefined, "data.state.deep")

        return (
            <Checkbox
                isSelected={deep || false}
                onValueChange={setDeep}
                size="sm"
            >
                Deep merge
            </Checkbox>
        )
    },
}