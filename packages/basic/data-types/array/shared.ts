import type { SharedDataTypeDefinition } from "@types"
import { z } from "zod"


export default {
    name: "List",
    description: "A list of values.",
    schema: z.array(z.any()),
} satisfies SharedDataTypeDefinition