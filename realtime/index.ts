import { Client, type Notification } from "pg"
import { WebSocketServer } from "ws"
import { z, type ZodSchema } from "zod"


const CHANNELS = {
    new_personal_project: {
        schema: z.object({
            userId: z.string().uuid(),
        }),
        testEvent: (payload, params) => payload.creator === params.userId,
    }
} as const satisfies {
    [k: string]: {
        schema: ZodSchema
        testEvent: (payload: any, params: any) => boolean
    }
}

const port = process.env.PORT ? parseInt(process.env.PORT) : 8002

if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL not set")

const db = new Client({
    connectionString: process.env.DATABASE_URL,
})
await db.connect()

await Promise.all(Object.keys(CHANNELS).map(ch => db.query(`LISTEN ${ch}`)))
process.on("beforeExit", async () => {
    await Promise.all(Object.keys(CHANNELS).map(ch => db.query(`UNLISTEN ${ch}`)))
    await db.end()
})

const wss = new WebSocketServer({ port })
console.log("WebSocket server listening on", port)

wss.on("connection", function connection(ws, req) {
    console.debug("Client connected @", req.url)

    ws.on("error", console.error)
    ws.on("close", () => void console.debug("Client disconnected"))

    const url = new URL(req.url!, `http://${req.headers.host}`)

    const channel = url.pathname.split("/")[3]
    const isValidChannel = channel ? !!CHANNELS[channel as any] : false

    if (!channel || !isValidChannel) {
        console.debug("Invalid channel:", channel)
        process.nextTick(() => void ws.close(1003, "Invalid channel"))
        return
    }

    const validChannel = channel as RealtimeChannel
    const rawParams = Object.fromEntries(url.searchParams.entries())
    const validation = CHANNELS[validChannel].schema.safeParse(rawParams)

    if (!validation.success) {
        console.debug("Invalid params:", validation.error)
        process.nextTick(() => void ws.close(1008, "Invalid params"))
        return
    }

    const listener = (msg: Notification) => {
        if (!msg.payload || msg.channel !== channel)
            return

        let parsedPayload: any
        try {
            parsedPayload = JSON.parse(msg.payload)
        } catch (err) {
            console.error("Error parsing payload:", err)
            return
        }

        if (!CHANNELS[validChannel].testEvent(parsedPayload, validation.data))
            return

        ws.send(msg.payload)
    }
    db.on("notification", listener)
    ws.on("close", () => void db.removeListener("notification", listener))
})

wss.on("error", console.error)


export type RealtimeChannel = keyof typeof CHANNELS
export type RealtimeChannelParams<T extends RealtimeChannel> = z.infer<typeof CHANNELS[T]["schema"]>