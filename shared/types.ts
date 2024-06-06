

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
        serviceAccount?: string
    }
}

export type Edge = {
    id: string
    source: string
    sourceHandle: string
    target: string
    targetHandle: string
}
