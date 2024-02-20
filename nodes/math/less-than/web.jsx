// math/less-than/web.jsx
import { Checkbox } from "@nextui-org/react"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { TbMathLower } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: TbMathLower,
    color: colors.gray[800],
    tags: ["Math", "Comparison"],
    inputs: {
        a: {},
        b: {},
    },
    outputs: {
        result: {},
    },
    renderBody: () => {
        const [orEqual, setOrEqual] = useNodeProperty(undefined, "data.state.orEqual")

        return (
            <Checkbox
                isSelected={orEqual || false}
                onValueChange={setOrEqual}
                size="sm"
            >
                or equal to
            </Checkbox>
        )
    },
}
