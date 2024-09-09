import { z } from "zod"
import { createPackage } from "../../registry/registry.server"

const helper = createPackage("time")

helper.node("datetime", {
    name: "Data & Time",
    action(inputs, ctx) {
        const { date, time } = z.object({
            date: z.date().optional(),
            time: z.string().regex(/^\d\d:\d\d$/).optional(),
        }).parse(ctx.node.config)

        if (!date) return { date: null }

        const [hours, minutes] = (time || "00:00").split(":").map(s => parseInt(s))
        date.setHours(hours, minutes)
        return { date }
    },
})

helper.node("date", {
    name: "Date",
    action(inputs, ctx) {
        const { date } = z.object({
            date: z.date().optional(),
        }).parse(ctx.node.config)

        return { date: date || null }
    },
})