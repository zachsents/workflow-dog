import { z } from "zod"
import { createPackage } from "../../registry/registry.server"
import axios from "axios"
import { decodeValue, encodeValue } from "../../lib/value-types.server"

const helper = createPackage("utility")

helper.node("ternary", {
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

helper.node("router", {
    name: "Route Value",
    action(inputs) {
        const { condition, value } = z.object({
            condition: z.boolean(),
            value: z.any(),
        }).parse(inputs)

        return condition ? { truthy: value } : { falsy: value }
    },
})

helper.node("passthrough", {
    name: "Passthrough",
    action(inputs) {
        const { valueIn } = z.object({
            valueIn: z.any(),
        }).parse(inputs)

        return { valueOut: valueIn }
    },
})

helper.node("isNull", {
    name: "Is Null",
    async action(inputs) {
        const { value } = z.object({
            value: z.any(),
        }).parse(inputs)

        return { isNull: value == null }
    },
})

helper.node("comment", {
    name: "Comment",
    action() { },
})

helper.node("jsonParse", {
    name: "Parse JSON",
    action(inputs) {
        const { json } = z.object({
            json: z.string(),
        }).parse(inputs)

        return { parsed: JSON.parse(json) }
    },
})

helper.node("jsonStringify", {
    name: "Convert to JSON",
    action(inputs) {
        const { value } = z.object({
            value: z.any(),
        }).parse(inputs)

        return { json: JSON.stringify(value) }
    },
})

helper.node("toString", {
    name: "Convert to Text",
    action(inputs) {
        const { value } = z.object({
            value: z.any(),
        }).parse(inputs)

        return { text: `${value}` }
    },
})

helper.node("coalesce", {
    name: "Coalesce",
    action(inputs) {
        const { values } = z.object({
            values: z.array(z.any()).default([]),
        }).parse(inputs)

        return { value: values.find(v => v != null) ?? null }
    },
})

helper.node("triggerData", {
    name: "Trigger Data",
    action(inputs, ctx) {
        return ctx.eventPayload
    },
})

helper.node("returnData", {
    name: "Return Data",
    action(inputs, ctx) {
        const { data } = z.object({
            data: z.any().refine(v => v !== undefined, "Required"),
        }).parse(inputs)
        ctx.respond({ dataOut: data })
    },
    respondsToTriggerSynchronously: true,
})

helper.node("runWorkflow", {
    name: "Run Workflow",
    async action(inputs, ctx) {
        const { payload } = z.object({
            payload: z.any(),
        }).parse(inputs)

        const { selectedWorkflow } = z.object({
            selectedWorkflow: z.string().uuid(),
        }).parse(ctx.node.config)

        const url = `http://localhost:${process.env.PORT}/run/x/callable_${selectedWorkflow}`

        const result = await axios.post(url, encodeValue(payload))
            .then(r => decodeValue(r.data))
        return { result }
    },
})

helper.node("loopWorkflow", {
    name: "Loop Workflow",
    async action(inputs, ctx) {
        const { payloads } = z.object({
            payloads: z.any().array(),
        }).parse(inputs)

        const { selectedWorkflow } = z.object({
            selectedWorkflow: z.string().uuid(),
        }).parse(ctx.node.config)

        const url = `http://localhost:${process.env.PORT}/run/x/callable_${selectedWorkflow}`

        const results = await Promise.all(payloads.map(payload =>
            axios.post(url, encodeValue(payload)).then(r => decodeValue(r.data))
        ))
        return { results }
    },
})

helper.node("equals", {
    name: "Equals",
    action(inputs) {
        const { a, b } = z.object({
            a: z.any(),
            b: z.any(),
        }).parse(inputs)

        return { result: a == b }
    },
})