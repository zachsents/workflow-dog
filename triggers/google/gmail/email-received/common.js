
export default {
    name: "Gmail Email Received",
    whenName: "When an email is received",
    description: "Triggered when an email is received in a Gmail inbox.",

    inputs: {
        messageId: {
            name: "Message ID",
            type: "data-type:basic.string",
        },
        senderName: {
            name: "Sender Name",
            type: "data-type:basic.string",
        },
        senderEmailAddress: {
            name: "Sender Email Address",
            type: "data-type:basic.string",
        },
        subject: {
            name: "Subject",
            type: "data-type:basic.string",
        },
        date: {
            name: "Date",
            type: "data-type:basic.date",
        },
        plainText: {
            name: "Plain Text",
            type: "data-type:basic.string",
        },
        html: {
            name: "HTML",
            type: "data-type:basic.string",
        },
        recipientName: {
            name: "Recipient Name",
            type: "data-type:basic.string",
        },
        recipientEmailAddress: {
            name: "Recipient Email Address",
            type: "data-type:basic.string",
        },
    }
}