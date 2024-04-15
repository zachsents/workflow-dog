import { regexSchema } from "@pkg/text/schemas"
import { createSharedDataTypeDefinition } from "@pkg/types"


export default createSharedDataTypeDefinition({
    name: "Regex",
    description: "A regular expression",
    schema: regexSchema,
})