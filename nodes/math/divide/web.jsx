// math/divide/web.jsx
import { TbDivide } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: TbDivide,
    color: colors.gray[800],
    tags: ["Math"],
    inputs: {
        dividend: {},
        divisor: {},
    },
    outputs: {
        quotient: {},
        remainder: {},
    },
}
