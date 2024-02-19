import { TbHandClick } from "react-icons/tb"
import colors from "tailwindcss/colors"

export default {
    icon: TbHandClick,
    color: colors.gray[800],
    renderConfig: () => <p className="text-sm text-default-500">
        This workflow is triggered when it's ran from a "Run Workflow" task in another workflow.
    </p>
}