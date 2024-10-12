import { z } from "zod"
import { createPackage } from "../../registry/registry.server"

const helper = createPackage("logic")

// #region Comparison

helper.node("equal", {
    name: "Equals",
    action(inputs) {
        const { a, b } = z.object({
            a: z.any(),
            b: z.any(),
        }).parse(inputs)

        return { result: a === b }
    },
})

helper.node("notEqual", {
    name: "Not Equals",
    action(inputs) {
        const { a, b } = z.object({
            a: z.any(),
            b: z.any(),
        }).parse(inputs)

        return { result: a !== b }
    },
})

helper.node("not", {
    name: "Not",
    action(inputs) {
        const { value } = z.object({
            value: z.boolean(),
        }).parse(inputs)

        return { result: !value }
    },
})