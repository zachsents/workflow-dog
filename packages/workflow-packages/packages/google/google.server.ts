import { getThirdPartyAccountToken } from "api/lib/internal/third-party"
import { useEnvVar } from "api/lib/utils"
import axios from "axios"
import { createMimeMessage } from "mimetext"
import { z } from "zod"
import { createPackage } from "../../registry/registry.server"

const helper = createPackage("google")

helper.thirdPartyProvider(null, {
    name: "Google",
    tokenUsage: "auth_header_bearer",
    type: "oauth2",
    config: {
        clientId: useEnvVar("TP_GOOGLE_CLIENT_ID"),
        clientSecret: useEnvVar("TP_GOOGLE_CLIENT_SECRET"),
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        profileUrl: "https://oauth2.googleapis.com/tokeninfo",
        scopeDelimiter: " ",
        additionalParams: {
            access_type: "offline",
            include_granted_scopes: "true",
        },
        allowAdditionalParams: ["login_hint"],
        scopes: ["email", "profile"],
        allowAdditionalScopes: true,
        getDisplayName: ({ profile }: { profile: any }) => profile.email,
        getProviderUserId: ({ profile }) => profile.sub,
        includeRedirectUriInTokenRequest: true,
    },
})

helper.node("test", {
    name: "Test Google",
    async action(inputs, ctx) {
        const { account: accountId } = z.object({
            account: z.string().uuid(),
        }).parse(ctx.node.config)

        const googleAccount = await getThirdPartyAccountToken(accountId)

        const { data } = await axios.get("https://oauth2.googleapis.com/tokeninfo", {
            headers: {
                Authorization: `Bearer ${googleAccount.accessToken}`,
            },
        })

        console.log(data)
    },
})

helper.node("gmail_sendEmail", {
    name: "Send Email",
    async action(inputs, ctx) {
        const { account: accountId } = z.object({
            account: z.string().uuid(),
        }).parse(ctx.node.config)

        const { to, cc, subject, body } = z.object({
            to: z.string().email().array(),
            cc: z.string().email().array().default([]),
            subject: z.string(),
            body: z.string(),
        }).parse(inputs)

        const googleAccount = await getThirdPartyAccountToken(accountId)

        const msg = createMimeMessage()
        msg.setSender({ addr: googleAccount.account.email })
        msg.setRecipient(to)
        msg.setCc(cc)
        msg.setSubject(subject)
        msg.addMessage({
            contentType: "text/plain",
            data: body,
        })
        msg.setHeader("X-Triggered-By", "WorkflowDog")

        // attachments?.forEach(attachment => {
        //     msg.addAttachment({
        //         filename: attachment.name,
        //         contentType: attachment.mimeType,
        //         data: attachment.data,
        //         encoding: "base64",
        //     })
        // })

        const { data } = await axios.post(`https://gmail.googleapis.com/gmail/v1/users/me/messages/send`, {
            raw: Buffer.from(msg.asRaw()).toString("base64url"),
        }, {
            headers: {
                Authorization: `Bearer ${googleAccount.accessToken}`,
            },
        })

        console.log(data)

        // return { messageId: data.id }
    },
})