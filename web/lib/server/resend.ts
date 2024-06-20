import InviteMemberTemplate from "@web/components/email-templates/invite-member"
import { Resend } from "resend"
import { useEnvVars } from "./utils"


const { RESEND_KEY } = useEnvVars("RESEND_KEY", "RESEND_GENERAL_AUDIENCE_ID")


export const resend = new Resend(RESEND_KEY)


export type EmailTemplate<T extends Record<string, any>> = {
    subject: (params: T) => string
    react: (params: T) => JSX.Element
    text: (params: T) => string
}

export function createEmailTemplate<T extends Record<string, any>>(template: EmailTemplate<T>) {
    return template
}

const Templates = {
    "invite-member": InviteMemberTemplate,
}


export async function sendEmailFromTemplate<T extends keyof typeof Templates>(
    templateKey: T,
    templateParams: Parameters<typeof Templates[T]["react"]>[0],
    emailOptions: Omit<Parameters<typeof resend["emails"]["send"]>["0"], "from" | "react" | "html" | "text" | "subject">,
) {

    const template = Templates[templateKey]

    const { data, error } = await resend.emails.send({
        from: "WorkflowDog <info@workflow.dog>",
        subject: template.subject(templateParams),
        react: template.react(templateParams),
        text: template.text(templateParams),
        ...emailOptions,
    })

    if (error)
        throw error

    return data as { id: string }
}

