import { createSharedDataTypeDefinition } from "@pkg/types"
import { z } from "zod"


export default createSharedDataTypeDefinition({
    name: "T/F",
    description: "True or false",
    schema: z.boolean(),
})