import { createSharedDataTypeDefinition } from "@pkg/types"
import { z } from "zod"


export default createSharedDataTypeDefinition({
    name: "Text",
    description: "Some text",
    schema: z.string(),
})