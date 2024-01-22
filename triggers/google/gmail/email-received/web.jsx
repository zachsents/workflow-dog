import { TbBrandGmail } from "react-icons/tb"
import colors from "tailwindcss/colors"


export default {
    icon: TbBrandGmail,
    color: colors.red[800],
    renderConfig: () => {

    },
    inputs: {
        plainText: {
            stringSettings: { long: true },
        },
        html: {
            stringSettings: { long: true },
        },
        recipientName: {
            stringSettings: { long: true },
        },
        recipientEmailAddress: {
            stringSettings: { long: true },
        },
    }
}