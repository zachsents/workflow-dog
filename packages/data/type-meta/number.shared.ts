import { sharedTypeMeta } from "@pkg/helpers/shared"
import { z } from "zod"

const NumberType = sharedTypeMeta(import.meta.url, {
    name: "Number",
    description: "A number value",
    schema: z.number(),
})

export default NumberType