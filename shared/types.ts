

export type Node = {
    id: string
    position: { x: number, y: number }
    type: string
    width: number | null
    height: number | null
    positionAbsolute: { x: number, y: number }
    selected: boolean
    dragging: boolean
    data: {
        definition: string
        state: Record<string, any>
        inputs: {
            id: string
            definition: string
            name?: string
        }[]
        outputs: {
            id: string
            definition: string
            name?: string
        }[]
        disabled: boolean
        controlModifiers?: {
            conditional?: boolean
            waitFor?: boolean
            delay?: boolean
            finished?: boolean
            error?: boolean
        }
        integrationAccount?: string
    }
}

export type Edge = {
    id: string
    source: string
    sourceHandle: string
    target: string
    targetHandle: string
}


export type Workflow = {
    id: string
    created_at: string
    creator: string
    is_enabled: boolean
    name: string
    trigger: {
        type: string
        config?: Record<string, any>
    }
    team_id: string
    graph: WorkflowGraph
}

export type WorkflowGraph = {
    nodes: Node[]
    edges: Edge[]
}

export type WorkflowRunStatus = "pending" | "running" | "completed" | "failed" | "scheduled" | "canceled"


export type WorkflowRunState = {
    graph?: WorkflowGraph
    outputs?: {
        [nodeId: string]: {
            [outputId: string]: any
        }
    },
    errors?: {
        [nodeId: string]: string
    }
}

export type WorkflowRun = {
    id: string
    created_at: string
    state: WorkflowRunState
    status: WorkflowRunStatus
    trigger_data: Record<string, any>
    has_errors: boolean
    finished_at: string | null
    started_at: string | null
    scheduled_for: string | null
    count: number
    error_count: number
}


/* -------------------------------------------------------------------------- */
/*                                   Utility                                  */
/* -------------------------------------------------------------------------- */

type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : Lowercase<S>

export type Camel<T> = {
    [K in keyof T as CamelCase<string & K>]: T[K] extends {} ? Camel<T[K]> : T[K]
}
