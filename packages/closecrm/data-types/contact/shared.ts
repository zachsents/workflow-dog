import { createSharedDataTypeDefinition } from "@pkg/types"
import { contactSchema } from "../../schemas"

export default createSharedDataTypeDefinition({
    name: "Contact",
    description: "A contact from CloseCRM.",
    schema: contactSchema,
    compatibleWith: [
        "https://data-types.workflow.dog/basic/object",
    ],
})