import { assertArgProvided } from "@pkg/_lib"
import { createExecutionNodeDefinition } from "@pkg/types"
import { google } from "googleapis"
import shared from "./shared"


export default createExecutionNodeDefinition(shared, {
    action: async ({ messageId }, { token }) => {
        assertArgProvided(messageId, "message ID")

        const gmail = google.gmail({
            version: "v1",
            params: { access_token: token?.access_token },
        })

        await gmail.users.messages.trash({
            userId: "me",
            id: messageId,
        })

        return {}
    },
})
