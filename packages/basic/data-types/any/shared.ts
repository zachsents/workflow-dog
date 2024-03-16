import type { SharedDataTypeDefinition } from "@types"
import { z } from "zod"


export default {
    name: "Any",
    description: "Any data type",
    schema: z.any(),
} satisfies SharedDataTypeDefinition