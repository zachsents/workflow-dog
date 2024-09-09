import { z } from "zod"
import { createPackage } from "../../registry/registry.server"


const helper = createPackage("text")

helper.node("uppercase", {
    name: "Uppercase",
    async action(inputs) {
        const { text } = z.object({ text: z.string() }).parse(inputs)
        return { result: text.toUpperCase() }
    },
})

helper.node("lowercase", {
    name: "Lowercase",
    action(inputs) {
        const { text } = z.object({ text: z.string() }).parse(inputs)
        return { result: text.toLowerCase() }
    },
})

helper.node("titlecase", {
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

helper.node("template", {
    name: "Template",
    action(inputs) {
        const { template, substitutions } = z.object({
            template: z.string(),
            substitutions: z.record(
                z.string().refine(x => /^[\w -]+$/.test(x), "Substitution names can only contain letters, numbers, spaces, underscores, and dashes."),
                z.string(),
            ).default({}),
        }).parse(inputs)

        const result = Object.entries(substitutions).reduce((acc: string, [varName, content]) => {
            const pattern = new RegExp(`\\{{1,2}\\s*?${varName}\\s*?\\}{1,2}`, "g")
            return acc.replaceAll(pattern, content)
        }, template)

        return { result }
    },
})

helper.node("length", {
    name: "Text Length",
    action(inputs) {
        const { text } = z.object({ text: z.string() }).parse(inputs)
        return { length: text.length }
    },
})