// objects/add-property/web.jsx
import { TbCirclePlus } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: TbCirclePlus,
    color: colors.gray[800],
    tags: ["Objects"],
    inputs: {
        object: {},
        key: {},
        value: {},
    },
    outputs: {
        result: {},
    },
}