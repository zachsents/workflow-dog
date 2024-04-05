import { createSharedDataTypeDefinition } from "@pkg/types"
import { z } from "zod"


export default createSharedDataTypeDefinition({
    name: "Object",
    description: "A data object",
    schema: z.object({}).passthrough(),
})