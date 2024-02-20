// math/absolute/web.jsx
import { TbEqual } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: ({ className, ...props }) => <TbEqual className={`rotate-90 ${className}`} {...props} />,
    color: colors.gray[800],
    tags: ["Math"],
    inputs: {
        number: {},
    },
    outputs: {
        absolute: {},
    },
}
