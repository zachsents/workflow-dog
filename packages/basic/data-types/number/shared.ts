import type { SharedDataTypeDefinition } from "@types"
import { z } from "zod"


export default {
    name: "Number",
    description: "A number",
    schema: z.number(),
} satisfies SharedDataTypeDefinition