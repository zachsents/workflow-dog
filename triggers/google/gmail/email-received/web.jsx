import { TbBrandGmail } from "react-icons/tb"
import colors from "tailwindcss/colors"
import { Textarea } from "@nextui-org/react"

export default {
    icon: TbBrandGmail,
    color: colors.red[500],
    renderConfig: () => {

    },
    workflowInputs: {
        plainText: {
            inputComponent: Textarea,
        },
        html: {
            inputComponent: Textarea,
        },
        recipientName: {
            inputComponent: Textarea,
        },
        recipientEmailAddress: {
            inputComponent: Textarea,
        },
    }
}