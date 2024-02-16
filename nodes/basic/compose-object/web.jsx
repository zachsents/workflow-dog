import { TbArrowsJoin } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: TbArrowsJoin,
    color: colors.gray[800],
    tags: ["Basic"],
    inputs: {
        properties: {
            description: "The properties to compose into the data object.",
            named: true,
        }
    },
    outputs: {
        object: {
            description: "The composed object.",
        }
    },
}