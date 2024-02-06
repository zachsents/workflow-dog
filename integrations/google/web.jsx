import GoogleIcon from "@zachsents/brand-icons/icons/google.svg"
import colors from "tailwindcss/colors"

export default {
    icon: GoogleIcon,
    color: colors.blue[400],
    transformScope: scope => scope.match(/(?<=\/)[^/\s]+$/)?.[0] || scope,
}