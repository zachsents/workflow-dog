import type { WebTriggerDefinition } from "@types"
import type shared from "./shared"
import { TbClock } from "react-icons/tb"


export default {
    tags: ["Basic"],
    icon: TbClock,
    color: "#1f2937",
    renderConfig: () => <p className="text-sm text-muted-foreground">
        This worflow runs on a schedule.
    </p>,
} satisfies WebTriggerDefinition<typeof shared>