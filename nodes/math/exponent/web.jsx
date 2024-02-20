// math/exponent/web.jsx
import { TbSuperscript } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: TbSuperscript,
    color: colors.gray[800],
    tags: ["Math"],
    inputs: {
        base: {},
        exponent: {},
    },
    outputs: {
        result: {},
    },
}
