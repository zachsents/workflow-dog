import { z } from "zod"


export const phoneSchema = z.object({
    country: z.string(),
    phone: z.string(),
    phone_formatted: z.string(),
    type: z.string(),
})

export const emailSchema = z.object({
    type: z.string(),
    email: z.string(),
    is_unsubscribed: z.boolean(),
})

export const contactSchema = z.object({
    id: z.string(),
    organization_id: z.string(),
    lead_id: z.string(),
    name: z.string(),
    title: z.string(),
    phones: z.array(phoneSchema),
    emails: z.array(emailSchema),
    date_created: z.string(),
    date_updated: z.string(),
    created_by: z.string(),
    updated_by: z.string(),
})


export const opportunitySchema = z.object({
    status_id: z.string(),
    status_label: z.string(),
    status_type: z.string(),
    pipeline_id: z.string(),
    pipeline_name: z.string(),
    date_won: z.string().nullable(),
    confidence: z.number(),
    user_id: z.string().nullable(),
    contact_id: z.string().nullable(),
    updated_by: z.string().nullable(),
    date_updated: z.string(),
    value_period: z.string(),
    created_by: z.string().nullable(),
    note: z.string(),
    value: z.number(),
    value_formatted: z.string(),
    value_currency: z.string(),
    lead_name: z.string(),
    organization_id: z.string(),
    date_created: z.string(),
    user_name: z.string(),
    id: z.string(),
    lead_id: z.string(),
})

export const leadSchema = z.object({
    status_id: z.string(),
    status_label: z.string(),
    tasks: z.array(z.any()), // Tasks array details not provided, assuming any structure
    display_name: z.string(),
    addresses: z.array(z.any()), // Addresses array details not provided, assuming any structure
    name: z.string(),
    contacts: z.array(contactSchema),
    custom: z.record(z.union([z.string(), z.array(z.string())])),
    date_updated: z.string(),
    html_url: z.string(),
    created_by: z.string().nullable(),
    organization_id: z.string(),
    url: z.string().nullable(),
    opportunities: z.array(opportunitySchema),
    updated_by: z.string(),
    date_created: z.string(),
    id: z.string(),
    description: z.string(),
}).passthrough()


export const customLeadFieldSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.string(),
    choices: z.string().array().nullable(),
    accepts_multiple_values: z.boolean(),
    editable_with_roles: z.string().array(),
    date_created: z.date(),
    date_updated: z.date(),
    created_by: z.string(),
    updated_by: z.string(),
    organization_id: z.string()
})


export const envelopeFromSchema = z.object({
    email: z.string(),
    name: z.string(),
})

export const envelopeToSchema = z.object({
    email: z.string(),
    name: z.string(),
})

export const envelopeSchema = z.object({
    from: z.array(envelopeFromSchema),
    sender: z.array(envelopeFromSchema),
    to: z.array(envelopeToSchema),
    cc: z.array(z.string()),
    bcc: z.array(z.string()),
    reply_to: z.array(z.string()),
    date: z.string(),
    in_reply_to: z.nullable(z.string()),
    message_id: z.string(),
    subject: z.string(),
})

export const attachmentSchema = z.object({
    url: z.string(),
    filename: z.string(),
    size: z.number(),
    content_type: z.string(),
})

export const bodyTextQuotedSchema = z.object({
    text: z.string(),
    expand: z.boolean(),
})

export const emailActivitySchema = z.object({
    id: z.string(),
    _type: z.literal('Email'),
    organization_id: z.string(),
    lead_id: z.string(),
    contact_id: z.string(),
    date_created: z.string(),
    date_updated: z.string(),
    updated_by: z.string(),
    updated_by_name: z.string(),
    direction: z.string(),
    user_id: z.string(),
    user_name: z.string(),
    created_by: z.string(),
    created_by_name: z.string(),
    sender: z.string(),
    to: z.array(z.string()),
    cc: z.array(z.string()),
    bcc: z.array(z.string()),
    subject: z.string(),
    envelope: envelopeSchema,
    body_text: z.string(),
    body_html: z.string(),
    body_text_quoted: z.array(bodyTextQuotedSchema),
    attachments: z.array(attachmentSchema),
    status: z.string(),
    opens: z.array(z.unknown()),
    template_id: z.nullable(z.string()),
    send_attempts: z.array(z.unknown()),
    sequence_subscription_id: z.string(),
    sequence_id: z.string(),
    sequence_name: z.string(),
})
