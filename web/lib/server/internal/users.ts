import { type User } from "next-auth"
import { db } from "../db"
import { resend } from "../resend"


export async function initUser(user: User) {
    const [firstName, lastName] = user.name?.split(" ") ?? []

    const dbTransaction = db.transaction().execute(async trx => {
        // Create personal project
        const { id: newProjectId } = await trx.insertInto("projects")
            .values({
                name: `${firstName ? `${firstName}'s` : "My"} First Project`,
                creator: user.id,
                is_personal: true,
            })
            .returning("id")
            .executeTakeFirstOrThrow()

        await Promise.all([
            // Create user meta row
            trx.insertInto("user_meta")
                .values({
                    id: user.id,
                    personal_project_id: newProjectId,
                })
                .executeTakeFirstOrThrow(),

            // Add user as project member
            trx.insertInto("projects_users")
                .values({
                    project_id: newProjectId,
                    user_id: user.id,
                })
                .executeTakeFirstOrThrow(),
        ])
    })

    const resendReq = user.email ? await resend.contacts.create({
        firstName,
        lastName,
        audienceId: process.env.RESEND_GENERAL_AUDIENCE_ID!,
        email: user.email,
    }) : Promise.resolve()

    // TO DO: send welcome email

    await Promise.all([dbTransaction, resendReq])
}
