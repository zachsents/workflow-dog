import { createSharedDataTypeDefinition } from "@pkg/types"
import { z } from "zod"


export default createSharedDataTypeDefinition({
    name: "List",
    description: "A list of values.",
    schema: z.array(z.any()),
})