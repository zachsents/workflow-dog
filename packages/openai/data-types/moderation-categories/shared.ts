import { createSharedDataTypeDefinition } from "@pkg/types"
import { z } from "zod"

export default createSharedDataTypeDefinition({
    name: "Moderation Categories",
    description: "Categories moderated by from ChatGPT.",
    schema: z.object({
        "sexual": z.boolean(),
        "hate": z.boolean(),
        "harassment": z.boolean(),
        "self-harm": z.boolean(),
        "sexual/minors": z.boolean(),
        "hate/threatening": z.boolean(),
        "violence/graphic": z.boolean(),
        "self-harm/intent": z.boolean(),
        "self-harm/instructions": z.boolean(),
        "harassment/threatening": z.boolean(),
        "violence": z.boolean(),
    }),
})