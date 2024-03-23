import { z } from "zod"

export const generalSettingsSchema = z.object({
    projectName: z.string().min(1).max(120),
})

export type GeneralSettingsSchema = z.infer<typeof generalSettingsSchema>


export const inviteMemberSchema = z.object({
    email: z.string().email(),
})

export type InviteMemberSchema = z.infer<typeof inviteMemberSchema>