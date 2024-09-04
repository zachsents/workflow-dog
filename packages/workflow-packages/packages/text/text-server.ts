import { z } from "zod"
import { createPackageHelper } from "../../server-registry"


const helper = createPackageHelper("text")

helper.registerNodeDef("uppercase", {
    name: "Uppercase",
    async action(inputs) {
        const { text } = z.object({ text: z.string() }).parse(inputs)
        return { result: text.toUpperCase() }
    },
})

helper.registerNodeDef("lowercase", {
    name: "Lowercase",
    action(inputs) {
        const { text } = z.object({ text: z.string() }).parse(inputs)
        return { result: text.toLowerCase() }
    },
})

helper.registerNodeDef("titlecase", {
    name: "Title Case",
    action(inputs) {
        const { text } = z.object({ text: z.string() }).parse(inputs)
        return {
            result: text
                .split(/\s+/)
                .map(w => w[0].toUpperCase() + w.slice(1))
                .join(" "),
        }
    },
})