import { z } from "zod"
import { createPackage } from "../../registry/registry.server"


const helper = createPackage("math")

helper.node("add", {
    name: "Add",
    action(inputs) {
        const { addends } = z.object({
            addends: z.union([z.number(), z.null()]).array().default([]),
        }).parse(inputs)

        const sum = addends.reduce((acc: number, cur) => acc + (cur || 0), 0)

        return { sum }
    },
})

helper.node("subtract", {
    name: "Subtract",
    action(inputs) {
        const { minuends } = z.object({
            minuends: z.union([z.number(), z.null()]).array().default([]),
        }).parse(inputs)

        const difference = minuends.reduce((acc: number, cur, i) => acc + (i === 0 ? 1 : -1) * (cur || 0), 0)

        return { difference }
    },
})

helper.node("multiply", {
    name: "Multiply",
    action(inputs) {
        const { factors } = z.object({
            factors: z.union([z.number(), z.null()]).array().default([]),
        }).parse(inputs)

        const product = factors.reduce((acc: number, cur) => acc * (cur || 1), 1)

        return { product }
    },
})

helper.node("divide", {
    name: "Divide",
    action(inputs) {
        const { dividend, divisor } = z.object({
            dividend: z.number(),
            divisor: z.number().refine(n => n !== 0, "Can't divide by 0"),
        }).parse(inputs)

        return { quotient: dividend / divisor }
    },
})

helper.node("inverse", {
    name: "Inverse",
    action(inputs) {
        const { number } = z.object({
            number: z.number().refine(n => n !== 0, "Can't divide by 0"),
        }).parse(inputs)

        return { inverse: 1 / number }
    },
})

helper.node("negate", {
    name: "Negate",
    action(inputs) {
        const { number } = z.object({
            number: z.number(),
        }).parse(inputs)

        return { negation: -number }
    },
})

helper.node("max", {
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

helper.node("min", {
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

helper.node("power", {
    name: "Power",
    action(inputs) {
        const { base, exponent } = z.object({
            base: z.number(),
            exponent: z.number(),
        }).parse(inputs)

        return { result: base ** exponent }
    },
})

helper.node("sqrt", {
    name: "Square Root",
    action(inputs) {
        const { number } = z.object({
            number: z.number().nonnegative(),
        }).parse(inputs)

        return { sqrt: Math.sqrt(number) }
    },
})

helper.node("log", {
    name: "Logarithm",
    action(inputs) {
        const { number, base } = z.object({
            number: z.number().nonnegative(),
            base: z.number().default(Math.E),
        }).parse(inputs)

        return { log: Math.log(number) / Math.log(base) }
    },
})

helper.node("absolute", {
    name: "Absolute Value",
    action(inputs) {
        const { number } = z.object({
            number: z.number(),
        }).parse(inputs)

        return { absolute: Math.abs(number) }
    },
})

helper.node("clamp", {
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

helper.node("floor", {
    name: "Floor",
    action(inputs) {
        const { number } = z.object({
            number: z.number(),
        }).parse(inputs)

        return { floored: Math.floor(number) }
    },
})

helper.node("ceil", {
    name: "Ceil",
    action(inputs) {
        const { number } = z.object({
            number: z.number(),
        }).parse(inputs)

        return { ceiled: Math.ceil(number) }
    },
})

helper.node("round", {
    name: "Round",
    action(inputs) {
        const { number } = z.object({
            number: z.number(),
        }).parse(inputs)

        return { rounded: Math.round(number) }
    },
})

helper.node("random", {
    name: "Random Number",
    action(inputs) {
        const { min, max } = z.object({
            min: z.number().default(0),
            max: z.number().default(1),
        }).parse(inputs)

        return { random: Math.random() * (max - min) + min }
    },
})

helper.node("sin", {
    name: "Sine",
    action(inputs, ctx) {
        const { angle } = z.object({
            angle: z.number(),
        }).parse(inputs)

        const angleUnit = z.enum(["radians", "degrees"]).parse(ctx.node.config.angleUnit)

        return {
            result: angleUnit === "radians" ? Math.sin(angle)
                : angleUnit === "degrees" ? Math.sin(angle * 180 / Math.PI)
                    : undefined,
        }
    },
})

helper.node("cos", {
    name: "Cosine",
    action(inputs, ctx) {
        const { angle } = z.object({
            angle: z.number(),
        }).parse(inputs)

        const angleUnit = z.enum(["radians", "degrees"]).parse(ctx.node.config.angleUnit)

        return {
            result: angleUnit === "radians" ? Math.cos(angle)
                : angleUnit === "degrees" ? Math.cos(angle * 180 / Math.PI)
                    : undefined,
        }
    },
})

helper.node("tan", {
    name: "Tangent",
    action(inputs, ctx) {
        const { angle } = z.object({
            angle: z.number(),
        }).parse(inputs)

        const angleUnit = z.enum(["radians", "degrees"]).parse(ctx.node.config.angleUnit)

        return {
            result: angleUnit === "radians" ? Math.tan(angle)
                : angleUnit === "degrees" ? Math.tan(angle * 180 / Math.PI)
                    : undefined,
        }
    },
})