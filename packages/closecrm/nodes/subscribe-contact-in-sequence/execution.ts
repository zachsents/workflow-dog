import { assertArgProvided } from "@pkg/_lib"
import { getClient } from "@pkg/closecrm/lib"
import { createExecutionNodeDefinition } from "@pkg/types"
import shared from "./shared"

export default createExecutionNodeDefinition(shared, {
    action: async ({ contactId, contactEmail, senderEmail, sequenceId }, { token }) => {
        assertArgProvided(sequenceId, "sequence ID")
        assertArgProvided(contactId, "contact ID")
        assertArgProvided(contactEmail, "contact email")
        assertArgProvided(senderEmail, "sender email")

        const client = getClient(token?.key!)

        const connectedAccounts = await client.get("/connected_account/")
            .then(res => res.data.data)

        const senderAccount = connectedAccounts
            .filter((a: any) => ["google", "custom_email"].includes(a._type))
            .flatMap((a: any) => a.identities?.map((ident: any) => ({
                ...ident,
                id: a.id,
            })) || [])
            .find((ident: any) => ident.email === senderEmail)

        if (!senderAccount)
            throw new Error("Sending email account not found")

        await client.post("/sequence_subscription/", {
            "sequence_id": sequenceId,
            "contact_id": contactId,
            "contact_email": contactEmail,
            "sender_account_id": senderAccount.id,
            "sender_name": senderAccount.name,
            "sender_email": senderAccount.email,
        })

        return {}
    },
})
