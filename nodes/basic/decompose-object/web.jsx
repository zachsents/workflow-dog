import { TbArrowsSplit } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: TbArrowsSplit,
    color: colors.gray[800],
    tags: ["Basic"],
    inputs: {
        object: {
            description: "The piece of data to get properties from.",
        }
    },
    outputs: {
        properties: {
            description: "The properties from the data.",
        }
    },
}