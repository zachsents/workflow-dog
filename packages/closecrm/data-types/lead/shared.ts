import { createSharedDataTypeDefinition } from "@pkg/types"
import { leadSchema } from "../../schemas"

export default createSharedDataTypeDefinition({
    name: "Lead",
    description: "A lead from CloseCRM.",
    schema: leadSchema,
})