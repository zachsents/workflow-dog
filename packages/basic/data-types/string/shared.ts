import type { SharedDataTypeDefinition } from "@types"
import { z } from "zod"


export default {
    name: "Text",
    description: "Some text",
    schema: z.string(),
} satisfies SharedDataTypeDefinition