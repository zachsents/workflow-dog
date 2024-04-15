import { regexSchema } from "@pkg/text/schemas"
import { createSharedDataTypeDefinition } from "@pkg/types"
import { z } from "zod"


export default createSharedDataTypeDefinition({
    name: "Text or Regex",
    description: "Either text or a regular expression",
    schema: regexSchema.or(z.string()),
    compatibleWith: [
        "https://data-types.workflow.dog/basic/string",
        "https://data-types.workflow.dog/text/regex",
    ]
})