import type { User } from "supertokens-node"
import { db } from "../db"
import { resend } from "../resend"


export async function initUser(user: User, providerMetadata: any) {

    const name = providerMetadata.name ?? user.emails[0].split("@")[0]

    const firstName = providerMetadata.first_name
        ?? providerMetadata.given_name
        ?? providerMetadata.name?.split(" ")[0]

    const lastName = providerMetadata.last_name
        ?? providerMetadata.family_name
        ?? providerMetadata.name?.split(" ")[1]

    const dbTransaction = db.transaction().execute(async trx => {
        // Create user meta row
        // Create user meta row
        await trx.insertInto("user_meta")
            .values({
                id: user.id,
                name,
                first_name: firstName,
                last_name: lastName,
            })
            .executeTakeFirstOrThrow()

        // Create personal project
        const { id: newProjectId } = await trx.insertInto("projects")
            .values({
                name: `${(firstName || name) ? `${firstName || name}'s` : "My"} Project`,
                creator: user.id,
                is_personal: true,
            })
            .returning("id")
            .executeTakeFirstOrThrow()

        await trx.insertInto("projects_users")
            .values({
                project_id: newProjectId,
                user_id: user.id,
            })
            .executeTakeFirstOrThrow()

        return newProjectId
    })

    const resendReq = user.emails[0] ? await resend.contacts.create({
        firstName,
        lastName,
        audienceId: process.env.RESEND_GENERAL_AUDIENCE_ID!,
        email: user.emails[0],
    }) : Promise.resolve()

    // TO DO: send welcome email

    const [projectId] = await Promise.all([dbTransaction, resendReq])

    console.log("User initialized:", user.emails[0])

    return { projectId }
}
