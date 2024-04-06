import { fileSchema } from "@pkg/basic/schemas"
import { createSharedDataTypeDefinition } from "@pkg/types"


export default createSharedDataTypeDefinition({
    name: "File",
    description: "A file.",
    schema: fileSchema,
})