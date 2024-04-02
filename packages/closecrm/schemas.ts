import { z } from "zod"

export const phoneSchema = z.object({
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
    name: z.string(),
    title: z.string(),
    date_updated: z.string(),
    phones: z.array(phoneSchema),
    // Assuming custom fields' keys are dynamic and can vary, represent them with a catch-all
    custom: z.record(z.string()),
    created_by: z.string().nullable(),
    id: z.string(),
    organization_id: z.string(),
    date_created: z.string(),
    emails: z.array(emailSchema),
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
})
