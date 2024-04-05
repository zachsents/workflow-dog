import { createSharedDataTypeDefinition } from "@pkg/types"
import { z } from "zod"


export default createSharedDataTypeDefinition({
    name: "Any",
    description: "Any data type",
    schema: z.any(),
})