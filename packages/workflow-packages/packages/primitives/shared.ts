import type { ClientEventType } from "../../types/client"
import type { ServerEventType } from "../../types/server"
import type { Common } from "../../types/shared"


export const SharedEventTypeProperties = {
    // may need stuff here
} satisfies Record<string, Partial<Common<ClientEventType, ServerEventType>>>
