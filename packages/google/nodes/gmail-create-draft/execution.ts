import { assertArgProvided } from "@pkg/_lib"
import { createExecutionNodeDefinition } from "@pkg/types"
import { google } from "googleapis"
import { createMessage } from "../lib/gmail"
import shared from "./shared"


export default createExecutionNodeDefinition(shared, {
    action: async ({ to, message, subject, attachments }, { token }) => {
        assertArgProvided(to, "to")
        assertArgProvided(message, "message")
        assertArgProvided(subject, "subject")

        const gmail = google.gmail({
            version: "v1",
            params: { access_token: token?.access_token },
        })

        const encodedMessage = await createMessage(gmail, {
            to,
            subject,
            message: { text: message },
            attachments,
            mode: "encoded",
        }) as string

        await gmail.users.drafts.create({
            userId: "me",
            requestBody: {
                message: {
                    raw: encodedMessage,
                }
            }
        })

        return {}
    },
})
