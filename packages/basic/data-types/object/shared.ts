import type { SharedDataTypeDefinition } from "@types"
import { z } from "zod"


export default {
    name: "Object",
    description: "A data object",
    schema: z.object({}).passthrough(),
} satisfies SharedDataTypeDefinition