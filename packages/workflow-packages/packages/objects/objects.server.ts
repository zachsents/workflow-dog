import { z } from "zod"
import { createPackage } from "../../registry/registry.server"

const helper = createPackage("objects")

helper.node("getProperty", {
    name: "Get Property",
    action(inputs) {
        const { object, property } = z.object({
            object: z.object({}).passthrough(),
            property: z.string(),
        }).parse(inputs)

        return { value: object[property] }
    },
})

helper.node("getProperties", {
    name: "Get Properties",
    action(inputs, ctx) {
        const { object } = z.object({
            object: z.object({}).passthrough(),
        }).parse(inputs)

        const properties = ctx.node.handleStates.properties.multi.names as string[]

        const result = Object.fromEntries(properties.map(prop => [prop, object[prop]] as const))

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

        return { newObject: { ...object, [property]: value } }
    },
})

helper.node("setProperties", {
    name: "Set Properties",
    action(inputs, ctx) {
        const { object, properties } = z.object({
            object: z.object({}).passthrough().default({}),
            properties: z.object({}).passthrough().default({}),
        }).parse(inputs)

        return { newObject: { ...object, ...properties } }
    },
})