import { assertArgProvided } from "@pkg/_lib"
import { createExecutionNodeDefinition } from "@pkg/types"
import { google } from "googleapis"
import shared from "./shared"


export default createExecutionNodeDefinition(shared, {
    action: async ({ messageId, labels: searchLabels }, { token }) => {
        assertArgProvided(messageId, "message ID")

        const gmail = google.gmail({
            version: "v1",
            params: { access_token: token?.access_token },
        })

        const userLabels = await gmail.users.labels.list({
            userId: "me",
        }).then(res => res.data.labels || [])

        const labelIds = searchLabels
            .filter(Boolean)
            .map(search => userLabels.find(label =>
                search === label.id
                || new RegExp(search, "i").test(label.name!)
            )?.id)
            .filter(Boolean) as string[]

        console.log(labelIds)

        if (labelIds.length > 0)
            await gmail.users.messages.modify({
                userId: "me",
                id: messageId,
                requestBody: {
                    addLabelIds: labelIds,
                },
            })

        return {}
    },
})
