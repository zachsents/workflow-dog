import { clientTrigger } from "@pkg/helpers/client"
import shared from "./manual.shared"
import { TbHandClick } from "react-icons/tb"
import "@pkg/types/client"
import "@pkg/types/shared"
import { Button } from "@web/components/ui/button"

export default clientTrigger(shared, {
    icon: TbHandClick,
    color: "#4b5563",
    tags: ["Basic"],
    renderConfig: () =>
        <Button>
            Run Now
        </Button>,
})