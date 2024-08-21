import { Resend } from "resend"
import { useEnvVars } from "./utils"
import { buildEmail } from "email-templates"


const { RESEND_KEY } = useEnvVars("RESEND_KEY", "RESEND_GENERAL_AUDIENCE_ID")

export const resend = new Resend(RESEND_KEY)

export async function sendEmailFromTemplate(
    to: string | string[],
    templateName: Parameters<typeof buildEmail>[0],
    templateParams: Parameters<typeof buildEmail>[1],
) {
    return await resend.emails.send({
        to,
        from: "WorkflowDog <info@workflow.dog>",
        ...(await buildEmail(templateName, templateParams)),
    }).then(r => {
        if (r.error) throw r.error
        return r.data!
    })
}

