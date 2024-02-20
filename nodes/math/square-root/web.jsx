// math/square-root/web.jsx
import { TbSquareRoot } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: TbSquareRoot,
    color: colors.gray[800],
    tags: ["Math"],
    inputs: {
        number: {},
    },
    outputs: {
        sqrt: {},
    },
}
