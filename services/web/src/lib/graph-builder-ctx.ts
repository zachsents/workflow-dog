/** 
 * Context itself must be defined in a separate file to avoid issues with
 * Vite HMR.
 */
import { createContext } from "react"
import type { GraphBuilder } from "./graph-builder"

export const GraphBuilderContext = createContext<GraphBuilder | null>(null)
export const NodeContext = createContext<string | null>(null)