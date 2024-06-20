import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { createContext } from "@web/lib/server/trpc/setup"
import { appRouter } from "@web/lib/server/trpc/trpc"
import type { NextRequest } from "next/server"


const handler = (req: NextRequest) =>
    fetchRequestHandler({
        endpoint: "/api/trpc",
        router: appRouter,
        req: req,
        createContext: () => createContext(req),
        onError: ({ error, path }) => {
            console.log("Error in tRPC handler on path", path)
            console.error(error)
        },
    })

export { handler as GET, handler as POST }
