import type { ApiRouterInput } from "api/trpc/router"
import { createContext } from "react"

export const RunHistoryTableContext = createContext<{
    queryInput: ApiRouterInput["workflows"]["runs"]["list"]
} | null>(null)
