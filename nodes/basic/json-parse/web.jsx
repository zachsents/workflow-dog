import { TbBraces } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: TbBraces,
    color: colors.gray[800],
    tags: ["Basic", "JSON"],
    inputs: {
        text: {
            description: "The JSON text.",
        }
    },
    outputs: {
        object: {
            description: "Parsed data object.",
        }
    },
}