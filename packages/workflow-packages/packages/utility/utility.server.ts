import { z } from "zod"
import { createPackage } from "../../registry/registry.server"
import axios from "axios"
import { encodeValue } from "../../lib/value-types.server"

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

helper.node("respond", {
    name: "Respond",
    action(inputs, ctx) {
        ctx.respond(inputs)
    },
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

        const url = `http://localhost:${process.env.PORT}/api/run/callable_${selectedWorkflow}`

        await axios.post(url, encodeValue(payload))
    },
})

helper.node("loopWorkflow", {
    name: "Loop Workflow",
    async action(inputs, ctx) {

        const { payloads } = z.object({
            payloads: z.any().array(),
        }).parse(inputs)
        console.log(payloads)

        console.log(ctx.node.config)
        const { selectedWorkflow } = z.object({
            selectedWorkflow: z.string().uuid(),
        }).parse(ctx.node.config)
        console.log(selectedWorkflow)

        const url = `http://localhost:${process.env.PORT}/api/run/callable_${selectedWorkflow}`

        await Promise.all(payloads.map(payload =>
            axios.post(url, encodeValue(payload))
        ))
    },
})