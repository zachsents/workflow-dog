import { z } from "zod"

export const systemMessage = z.object({
    content: z.string(),
    role: z.literal("system"),
    name: z.string().optional(),
})

export const userMessageContentPart = z.discriminatedUnion("type", [
    z.object({
        type: z.literal("text"),
        text: z.string(),
    }),
    z.object({
        type: z.literal("image_url"),
        image_url: z.object({
            url: z.string(),
            detail: z.enum(["low", "high", "auto"]).optional(),
        }),
    }),
])

export const userMessage = z.object({
    content: z.string().or(z.array(userMessageContentPart)),
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

export const chatHistory = z.array(z.discriminatedUnion("role", [systemMessage, userMessage, assistantMessage, toolMessage]))