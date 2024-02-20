// objects/delete-property/web.jsx
import { TbCircleMinus } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: TbCircleMinus,
    color: colors.gray[800],
    tags: ["Objects"],
    inputs: {
        object: {},
        key: {},
    },
    outputs: {
        result: {},
    },
}