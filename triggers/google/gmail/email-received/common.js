import { Type } from "shared/types.js"

export default {
    name: "Gmail Email Received",
    whenName: "When an email is received",
    description: "Triggered when an email is received in a Gmail inbox.",

    inputs: {
        messageId: {
            name: "Message ID",
            type: Type.String(),
        },
        senderName: {
            name: "Sender Name",
            type: Type.String(),
        },
        senderEmailAddress: {
            name: "Sender Email Address",
            type: Type.String(),
        },
        subject: {
            name: "Subject",
            type: Type.String(),
        },
        date: {
            name: "Date",
            type: Type.Date(),
        },
        plainText: {
            name: "Plain Text",
            type: Type.String(),
        },
        html: {
            name: "HTML",
            type: Type.String(),
        },
        recipientName: {
            name: "Recipient Name",
            type: Type.String(),
        },
        recipientEmailAddress: {
            name: "Recipient Email Address",
            type: Type.String(),
        },
    }
}