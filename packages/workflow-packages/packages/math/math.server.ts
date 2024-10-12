import { z } from "zod"
import { createPackage } from "../../registry/registry.server"


const NOT_A_NUMBER_ERROR_MAP: z.ZodErrorMap = (issue, ctx) => {
    if (issue.code.startsWith("invalid")) {
        const asString = `${ctx.data}`
        return {
            message: `\`${asString.slice(0, 20)}${asString.length > 20 ? "..." : ""}\` is not a number`,
        }
    }
    return { message: ctx.defaultError }
}

const NUMBER_SCHEMA = z.number({ errorMap: NOT_A_NUMBER_ERROR_MAP })
const LIST_OF_NUMBERS_OR_NULL_SCHEMA = z.union([z.number(), z.null()], { errorMap: NOT_A_NUMBER_ERROR_MAP }).array().default([])


const helper = createPackage("math")

helper.node("add", {
    name: "Add",
    action(inputs) {
        const { addends } = z.object({
            addends: LIST_OF_NUMBERS_OR_NULL_SCHEMA,
        }).parse(inputs)

        const sum = addends.reduce((acc: number, cur) => acc + (cur || 0), 0)

        return { sum }
    },
})

helper.node("subtract", {
    name: "Subtract",
    action(inputs) {
        const { minuends } = z.object({
            minuends: LIST_OF_NUMBERS_OR_NULL_SCHEMA,
        }).parse(inputs)

        const difference = minuends.reduce((acc: number, cur, i) => acc + (i === 0 ? 1 : -1) * (cur || 0), 0)

        return { difference }
    },
})

helper.node("multiply", {
    name: "Multiply",
    action(inputs) {
        const { factors } = z.object({
            factors: LIST_OF_NUMBERS_OR_NULL_SCHEMA,
        }).parse(inputs)

        const product = factors.reduce((acc: number, cur) => acc * (cur || 1), 1)

        return { product }
    },
})

helper.node("divide", {
    name: "Divide",
    action(inputs) {
        const { dividend, divisor } = z.object({
            dividend: NUMBER_SCHEMA,
            divisor: NUMBER_SCHEMA.refine(n => n !== 0, "Can't divide by 0"),
        }).parse(inputs)

        return { quotient: dividend / divisor }
    },
})

helper.node("inverse", {
    name: "Inverse",
    action(inputs) {
        const { number } = z.object({
            number: NUMBER_SCHEMA.refine(n => n !== 0, "Can't divide by 0"),
        }).parse(inputs)

        return { inverse: 1 / number }
    },
})

helper.node("negate", {
    name: "Negate",
    action(inputs) {
        const { number } = z.object({
            number: NUMBER_SCHEMA,
        }).parse(inputs)

        return { negation: -number }
    },
})

helper.node("max", {
    name: "Max",
    action(inputs) {
        const { numbers } = z.object({
            numbers: LIST_OF_NUMBERS_OR_NULL_SCHEMA,
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
            numbers: LIST_OF_NUMBERS_OR_NULL_SCHEMA,
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
            base: NUMBER_SCHEMA,
            exponent: NUMBER_SCHEMA,
        }).parse(inputs)

        return { result: base ** exponent }
    },
})

helper.node("sqrt", {
    name: "Square Root",
    action(inputs) {
        const { number } = z.object({
            number: NUMBER_SCHEMA.nonnegative(),
        }).parse(inputs)

        return { sqrt: Math.sqrt(number) }
    },
})

helper.node("log", {
    name: "Logarithm",
    action(inputs) {
        const { number, base } = z.object({
            number: NUMBER_SCHEMA.nonnegative(),
            base: NUMBER_SCHEMA.default(Math.E),
        }).parse(inputs)

        return { log: Math.log(number) / Math.log(base) }
    },
})

helper.node("absolute", {
    name: "Absolute Value",
    action(inputs) {
        const { number } = z.object({
            number: NUMBER_SCHEMA,
        }).parse(inputs)

        return { absolute: Math.abs(number) }
    },
})

helper.node("clamp", {
    name: "Clamp",
    action(inputs) {
        const { number, min, max } = z.object({
            number: NUMBER_SCHEMA,
            min: NUMBER_SCHEMA.optional(),
            max: NUMBER_SCHEMA.optional(),
        }).parse(inputs)

        let clamped = number
        if (min != null) clamped = Math.max(min, clamped)
        if (max != null) clamped = Math.min(max, clamped)
        return { clamped }
    },
})

helper.node("floor", {
    name: "Floor",
    action(inputs) {
        const { number } = z.object({
            number: NUMBER_SCHEMA,
        }).parse(inputs)

        return { floored: Math.floor(number) }
    },
})

helper.node("ceil", {
    name: "Ceil",
    action(inputs) {
        const { number } = z.object({
            number: NUMBER_SCHEMA,
        }).parse(inputs)

        return { ceiled: Math.ceil(number) }
    },
})

helper.node("round", {
    name: "Round",
    action(inputs) {
        const { number } = z.object({
            number: NUMBER_SCHEMA,
        }).parse(inputs)

        return { rounded: Math.round(number) }
    },
})

helper.node("random", {
    name: "Random Number",
    action(inputs) {
        const { min, max } = z.object({
            min: NUMBER_SCHEMA.default(0),
            max: NUMBER_SCHEMA.default(1),
        }).parse(inputs)

        return { random: Math.random() * (max - min) + min }
    },
})


// #region Comparison
helper.node("greaterThan", {
    name: "Greater Than",
    action(inputs) {
        const { a, b } = z.object({
            a: NUMBER_SCHEMA,
            b: NUMBER_SCHEMA,
        }).parse(inputs)

        return { result: a > b }
    },
})

helper.node("greaterThanOrEqual", {
    name: "Greater Than or Equal",
    action(inputs) {
        const { a, b } = z.object({
            a: NUMBER_SCHEMA,
            b: NUMBER_SCHEMA,
        }).parse(inputs)

        return { result: a >= b }
    },
})

helper.node("lessThan", {
    name: "Less Than",
    action(inputs) {
        const { a, b } = z.object({
            a: NUMBER_SCHEMA,
            b: NUMBER_SCHEMA,
        }).parse(inputs)

        return { result: a < b }
    },
})

helper.node("lessThanOrEqual", {
    name: "Less Than or Equal",
    action(inputs) {
        const { a, b } = z.object({
            a: NUMBER_SCHEMA,
            b: NUMBER_SCHEMA,
        }).parse(inputs)

        return { result: a <= b }
    },
})


// #region Trigonometry

helper.node("sin", {
    name: "Sine",
    action(inputs, ctx) {
        const { angle } = z.object({
            angle: NUMBER_SCHEMA,
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
            angle: NUMBER_SCHEMA,
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
            angle: NUMBER_SCHEMA,
        }).parse(inputs)

        const angleUnit = z.enum(["radians", "degrees"]).parse(ctx.node.config.angleUnit)

        return {
            result: angleUnit === "radians" ? Math.tan(angle)
                : angleUnit === "degrees" ? Math.tan(angle * 180 / Math.PI)
                    : undefined,
        }
    },
})

helper.node("pi", {
    name: "Pi",
    action() {
        return { pi: Math.PI }
    },
})

helper.node("e", {
    name: "E",
    action() {
        return { e: Math.E }
    },
})