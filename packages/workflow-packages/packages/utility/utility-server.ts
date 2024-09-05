import { z } from "zod"
import { createPackageHelper } from "../../server-registry"

const helper = createPackageHelper("utility")

helper.registerNodeDef("ternary", {
    name: "Choose Value",
    action(inputs) {
        const { condition, truthy, falsy } = z.object({
            condition: z.boolean(),
            truthy: z.any().optional(),
            falsy: z.any().optional(),
        }).parse(inputs)

        return { result: condition ? truthy : falsy }
    },
})

helper.registerNodeDef("router", {
    name: "Route Value",
    action(inputs) {
        const { condition, value } = z.object({
            condition: z.boolean(),
            value: z.any(),
        }).parse(inputs)

        return condition ? { truthy: value } : { falsy: value }
    },
})

helper.registerNodeDef("passthrough", {
    name: "Passthrough",
    action(inputs) {
        const { valueIn } = z.object({
            valueIn: z.any(),
        }).parse(inputs)

        return { valueOut: valueIn }
    },
})

helper.registerNodeDef("isNull", {
    name: "Is Null",
    async action(inputs) {
        const { value } = z.object({
            value: z.any(),
        }).parse(inputs)

        return { isNull: value == null }
    },
})

helper.registerNodeDef("comment", {
    name: "Comment",
    action() { },
})