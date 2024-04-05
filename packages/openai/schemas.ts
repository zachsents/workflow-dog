import { z } from "zod"

export const systemMessage = z.object({
    content: z.string(),
    role: z.literal("system"),
    name: z.string().optional(),
})

export const userMessage = z.object({
    content: z.string(),
    role: z.literal("user"),
    name: z.string().optional(),
})

export const assistantMessage = z.object({
    content: z.union([z.string(), z.null()]).optional(),
    role: z.literal("assistant"),
    name: z.string().optional(),
    // TODO: implement tool_calls (not function_calls it's deprecated)
})

export const toolMessage = z.object({
    content: z.string(),
    role: z.literal("tool"),
    tool_call_id: z.string(),
})