import { createSharedDataTypeDefinition } from "@pkg/types"
import { z } from "zod"


export default createSharedDataTypeDefinition({
    name: "Date/Time",
    description: "A date and time",
    schema: z.string().datetime(),
})