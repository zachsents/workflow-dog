import { z } from "zod"

export const regexSchema = z.object({
    pattern: z.string(),
    flags: z.string(),
})