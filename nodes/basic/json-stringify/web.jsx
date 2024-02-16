import { TbBraces } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: TbBraces,
    color: colors.gray[800],
    tags: ["Basic", "JSON"],
    inputs: {
        object: {
            description: "The data object to convert.",
        }
    },
    outputs: {
        text: {
            description: "The JSON text.",
        }  
    },
}