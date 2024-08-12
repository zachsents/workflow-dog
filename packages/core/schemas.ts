import { z } from "zod"

export const PROJECT_NAME_SCHEMA = z.string()
    .min(1, "Project name must be at least 1 character")
    .max(120, "Project name must be at most 120 characters")
    .transform(s => s.trim())
export const WORKFLOW_NAME_SCHEMA = z.string()
    .min(1, "Workflow name must be at least 1 character")
    .max(300, "Workflow name must be at most 300 characters")
    .transform(s => s.trim())

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
        Name: z.string().min(1).max(300),
    },
}