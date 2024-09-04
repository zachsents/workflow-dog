import { z } from "zod"
import { createPackageHelper } from "../../server-registry"

const helper = createPackageHelper("objects")

helper.registerNodeDef("getProperty", {
    name: "Get Property",
    action(inputs) {
        const { object, property } = z.object({
            object: z.object({}).passthrough(),
            property: z.string(),
        }).parse(inputs)

        return { value: object[property] }
    },
})

helper.registerNodeDef("getProperties", {
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

helper.registerNodeDef("setProperty", {
    name: "Set Property",
    action(inputs) {
        const { object, property, value } = z.object({
            object: z.object({}).passthrough(),
            property: z.string(),
            value: z.any(),
        }).parse(inputs)

        return { newObject: { ...object, [property]: value } }
    },
})
