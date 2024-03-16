import type { SharedDataTypeDefinition } from "@types"
import { z } from "zod"


export default {
    name: "Boolean",
    description: "True or false",
    schema: z.boolean(),
} satisfies SharedDataTypeDefinition