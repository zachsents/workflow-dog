import { sharedTypeMeta } from "@pkg/helpers/shared"
import { z } from "zod"

const BooleanType = sharedTypeMeta(import.meta.url, {
    name: "T/F",
    description: "True or false",
    schema: z.boolean(),
})

export default BooleanType