import { Type } from "shared/types.js"

export default {
    name: "Gmail Email Received",
    whenName: "When an email is received",
    description: "Triggered when an email is received in a Gmail inbox.",

    workflowInputs: {
        messageId: {
            label: "Message ID",
            type: Type.String(),
        },
        senderName: {
            label: "Sender Name",
            type: Type.String(),
        },
        senderEmailAddress: {
            label: "Sender Email Address",
            type: Type.String(),
        },
        subject: {
            label: "Subject",
            type: Type.String(),
        },
        date: {
            label: "Date",
            type: Type.Date(),
        },
        plainText: {
            label: "Plain Text",
            type: Type.String(),
        },
        html: {
            label: "HTML",
            type: Type.String(),
        },
        recipientName: {
            label: "Recipient Name",
            type: Type.String(),
        },
        recipientEmailAddress: {
            label: "Recipient Email Address",
            type: Type.String(),
        },
    }
}