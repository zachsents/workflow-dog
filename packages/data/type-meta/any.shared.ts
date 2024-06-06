import { sharedTypeMeta } from "@pkg/helpers/shared"
import { z } from "zod"

const AnyType = sharedTypeMeta(import.meta.url, {
    name: "Any",
    description: "This could be any type",
    schema: z.any(),
})

export default AnyType