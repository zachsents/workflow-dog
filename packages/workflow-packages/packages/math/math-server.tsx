import { z } from "zod"
import { createPackageHelper } from "../../server-registry"


const helper = createPackageHelper("math")

helper.registerNodeDef("add", {
    name: "Add",
    action(inputs) {
        const { addends } = z.object({
            addends: z.union([z.number(), z.null()]).array().default([]),
        }).parse(inputs)

        const sum = addends.reduce((acc: number, cur) => acc + (cur || 0), 0)

        return { sum }
    },
})

helper.registerNodeDef("subtract", {
    name: "Subtract",
    action(inputs) {
        const { minuends } = z.object({
            minuends: z.union([z.number(), z.null()]).array().default([]),
        }).parse(inputs)

        const difference = minuends.reduce((acc: number, cur, i) => acc + (i === 0 ? 1 : -1) * (cur || 0), 0)

        return { difference }
    },
})

helper.registerNodeDef("multiply", {
    name: "Multiply",
    action(inputs) {
        const { factors } = z.object({
            factors: z.union([z.number(), z.null()]).array().default([]),
        }).parse(inputs)

        const product = factors.reduce((acc: number, cur) => acc * (cur || 1), 1)

        return { product }
    },
})

helper.registerNodeDef("divide", {
    name: "Divide",
    action(inputs) {
        const { dividend, divisor } = z.object({
            dividend: z.number(),
            divisor: z.number().refine(n => n !== 0, "Can't divide by 0"),
        }).parse(inputs)

        return { quotient: dividend / divisor }
    },
})

helper.registerNodeDef("inverse", {
    name: "Inverse",
    action(inputs) {
        const { number } = z.object({
            number: z.number().refine(n => n !== 0, "Can't divide by 0"),
        }).parse(inputs)

        return { inverse: 1 / number }
    },
})

helper.registerNodeDef("negate", {
    name: "Negate",
    action(inputs) {
        const { number } = z.object({
            number: z.number(),
        }).parse(inputs)

        return { negation: -number }
    },
})

helper.registerNodeDef("max", {
    name: "Max",
    action(inputs) {
        const { numbers } = z.object({
            numbers: z.union([z.number(), z.null()]).array().default([]),
        }).parse(inputs)

        const max = numbers.reduce((acc: number, _cur) => {
            const cur = _cur || -Infinity
            return cur > acc ? cur : acc
        }, -Infinity)

        return { max }
    },
})

helper.registerNodeDef("min", {
    name: "Min",
    action(inputs) {
        const { numbers } = z.object({
            numbers: z.union([z.number(), z.null()]).array().default([]),
        }).parse(inputs)

        const min = numbers.reduce((acc: number, _cur) => {
            const cur = _cur || Infinity
            return cur < acc ? cur : acc
        }, Infinity)

        return { min }
    },
})

helper.registerNodeDef("power", {
    name: "Power",
    action(inputs) {
        const { base, exponent } = z.object({
            base: z.number(),
            exponent: z.number(),
        }).parse(inputs)

        return { result: base ** exponent }
    },
})

helper.registerNodeDef("sqrt", {
    name: "Square Root",
    action(inputs) {
        const { number } = z.object({
            number: z.number().nonnegative(),
        }).parse(inputs)

        return { sqrt: Math.sqrt(number) }
    },
})

helper.registerNodeDef("log", {
    name: "Logarithm",
    action(inputs) {
        const { number, base } = z.object({
            number: z.number().nonnegative(),
            base: z.number().default(Math.E),
        }).parse(inputs)

        return { log: Math.log(number) / Math.log(base) }
    },
})

helper.registerNodeDef("absolute", {
    name: "Absolute Value",
    action(inputs) {
        const { number } = z.object({
            number: z.number(),
        }).parse(inputs)

        return { absolute: Math.abs(number) }
    },
})

helper.registerNodeDef("clamp", {
    name: "Clamp",
    action(inputs) {
        const { number, min, max } = z.object({
            number: z.number(),
            min: z.number(),
            max: z.number(),
        }).parse(inputs)

        return { clamped: Math.max(min, Math.min(max, number)) }
    },
})

helper.registerNodeDef("floor", {
    name: "Floor",
    action(inputs) {
        const { number } = z.object({
            number: z.number(),
        }).parse(inputs)

        return { floored: Math.floor(number) }
    },
})

helper.registerNodeDef("ceil", {
    name: "Ceil",
    action(inputs) {
        const { number } = z.object({
            number: z.number(),
        }).parse(inputs)

        return { ceiled: Math.ceil(number) }
    },
})

helper.registerNodeDef("round", {
    name: "Round",
    action(inputs) {
        const { number } = z.object({
            number: z.number(),
        }).parse(inputs)

        return { rounded: Math.round(number) }
    },
})

helper.registerNodeDef("random", {
    name: "Random Number",
    action(inputs) {
        const { min, max } = z.object({
            min: z.number().default(0),
            max: z.number().default(1),
        }).parse(inputs)

        return { random: Math.random() * (max - min) + min }
    },
})
