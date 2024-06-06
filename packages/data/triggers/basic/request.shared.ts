import NumberType from "@pkg/data/type-meta/number.shared"
import StringType from "@pkg/data/type-meta/string.shared"
import { sharedTrigger } from "@pkg/helpers/shared"
import "@pkg/types/shared"

export default sharedTrigger(import.meta.url, {
    name: "Manual",
    whenName: "When triggered manually",
    description: "Triggered manually.",
    inputs: {
        method: {
            name: "Method",
            schema: StringType.schema,
            groupType: "normal",
        },
        headers: {
            name: "Headers",
            schema: StringType.schema,
            groupType: "record",
        },
        params: {
            name: "Query Parameters",
            schema: StringType.schema,
            groupType: "record",
        },
        body: {
            name: "Body",
            schema: StringType.schema,
            groupType: "normal",
        },
    },
    outputs: {
        status: {
            name: "Status Code",
            schema: NumberType.schema,
            groupType: "normal",
        },
        headers: {
            name: "Headers",
            schema: StringType.schema,
            groupType: "record",
        },
        body: {
            name: "Body",
            schema: StringType.schema,
            groupType: "normal",
        },
    },
})