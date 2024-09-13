import { z } from "zod"
import { createPackage } from "../../registry/registry.server"
import _get from "lodash/get"
import _set from "lodash/set"


const helper = createPackage("objects")

helper.node("getProperty", {
    name: "Get Property",
    action(inputs) {
        const { object, property } = z.object({
            object: z.object({}).passthrough(),
            property: z.string(),
        }).parse(inputs)

        return { value: _get(object, property) ?? null }
    },
})

helper.node("getProperties", {
    name: "Get Properties",
    action(inputs, ctx) {
        const { object } = z.object({
            object: z.object({}).passthrough(),
        }).parse(inputs)

        const properties = ctx.node.handleStates.properties.multi.names as string[]
        const result = Object.fromEntries(properties.map(prop => [prop, _get(object, prop) ?? null] as const))

        return { properties: result }
    },
})

helper.node("setProperty", {
    name: "Set Property",
    action(inputs) {
        const { object, property, value } = z.object({
            object: z.object({}).passthrough().default({}),
            property: z.string(),
            value: z.any(),
        }).parse(inputs)

        return { newObject: _set(structuredClone(object), property, value) }
    },
})

helper.node("setProperties", {
    name: "Set Properties",
    action(inputs) {
        const { object, properties } = z.object({
            object: z.object({}).passthrough().default({}),
            properties: z.object({}).passthrough().default({}),
        }).parse(inputs)

        const newObject = structuredClone(object)
        Object.entries(properties).forEach(([k, v]) => _set(newObject, k, v))

        return { newObject }
    },
})