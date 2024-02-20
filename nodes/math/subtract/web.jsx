// math/subtract/web.jsx
import { TbMinus } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: TbMinus,
    color: colors.gray[800],
    tags: ["Math"],
    inputs: {
        minuend: {},
        subtrahend: {},
    },
    outputs: {
        difference: {},
    },
}
