import { z } from "zod"

export const fileSchema = z.object({
    name: z.string(),
    mimeType: z.string().describe("MIME type of the file."),
    data: z.string().describe("Base64 encoded file data."),
})