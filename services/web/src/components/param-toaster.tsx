import { useSearchParamEffect } from "@web/lib/hooks"
import { toast } from "sonner"

export default function ParamToaster() {
    useSearchParamEffect("tm", message => {
        toast.info(message, { id: "param-toaster" })
    }, {
        clearAfterEffect: true,
    })
    return null
}