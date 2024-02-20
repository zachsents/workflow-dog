// math/log/web.jsx
import { TbMathSymbols } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: TbMathSymbols,
    color: colors.gray[800],
    tags: ["Math"],
    inputs: {
        number: {},
        base: {
            description: "Base of the logarithm (default: e)",
        },
    },
    outputs: {
        result: {},
    },
}

