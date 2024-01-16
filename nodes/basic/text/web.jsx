import { TbAbc } from "react-icons/tb"
import colors from "tailwindcss/colors"
import { useNodeProperty } from "../../_private/util"
import { Textarea } from "@nextui-org/react"


export default {
    icon: TbAbc,
    color: colors.gray[800],
    tags: ["Text", "Basic"],
    outputs: {
        text: {
            bullet: true,
        }
    },
    renderBody: ({ id }) => {

        const [value, setValue] = useNodeProperty(id, "data.state.value")

        return (
            <div className="flex justify-center items-stretch pr-unit-xs py-unit-xs">
                <Textarea
                    value={value ?? ""}
                    onValueChange={setValue}
                    minRows={1}
                    maxRows={12}
                    size="sm"
                    className="nodrag"
                />
            </div>
        )
    }
}