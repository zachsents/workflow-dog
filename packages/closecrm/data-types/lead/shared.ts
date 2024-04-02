import type { SharedDataTypeDefinition } from "@types"
import { leadSchema } from "../../schemas"

export default {
    name: "Lead",
    description: "A lead from CloseCRM.",
    schema: leadSchema,
} satisfies SharedDataTypeDefinition