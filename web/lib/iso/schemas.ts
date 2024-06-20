import { z } from "zod"

export const Schemas = {
    Projects: {
        Settings: z.object({
            name: z.string().min(1).max(120),
        }),
        InviteMember: z.object({
            email: z.string().email(),
        }),
        Permissions: z.enum(["read", "write"]),
    },
    Workflows: {
        Name: z.string().min(1).max(120),
    },
}