import { TbHandClick } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: TbHandClick,
    color: colors.gray[800],
    renderConfig: () => {
        return (
            <p className="text-center text-default-500 text-sm">
                No options to configure.
            </p>
        )
    },
}