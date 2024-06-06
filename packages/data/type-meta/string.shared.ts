import { sharedTypeMeta } from "@pkg/helpers/shared"
import { z } from "zod"

const StringType = sharedTypeMeta(import.meta.url, {
    name: "Text",
    description: "A text value",
    schema: z.string(),
})

export default StringType