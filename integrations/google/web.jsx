import { TbBrandGoogle } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: TbBrandGoogle,
    color: colors.blue[400],
    transformScope: scope => scope.match(/(?<=\/)[^/\s]+$/)?.[0] || scope,
}