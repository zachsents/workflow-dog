import { createEmailTemplate } from "@web/lib/server/resend"


export default createEmailTemplate<{
    invitationId: string
    projectName: string
}>({
    subject: ({ projectName }) => `WorkflowDog - You've been invited to work on "${projectName}"`,
    react: ({ invitationId, projectName }) => {
        const href = `${process.env.APP_URL}/invitations/${invitationId}/accept`
        return (
            <div style={{
                maxWidth: "70ch",
                // margin: "1em auto",
                // border: "2px solid lightgray",
                // borderRadius: "12px",
                // padding: "2em",
            }}>
                <p>
                    You've been invited to a project on WorkflowDog!
                </p>

                <p style={{ fontSize: "1.25em" }}>
                    <strong className="font-bold">{projectName}</strong>
                </p>
                <a href={href} style={{
                    background: "black",
                    color: "white",
                    padding: "0.75em 2em",
                    borderRadius: "6px",
                    display: "inline-block",
                    textDecoration: "none",
                    fontWeight: "bold",
                }}>
                    Accept Invitation
                </a>
            </div>
        )
    },
    text: ({ projectName, invitationId }) => `
You've been invited to a project on WorkflowDog!

Project: ${projectName}

Accept Invitation: ${process.env.APP_URL}/invitations/${invitationId}/accept
`.trim(),
})

