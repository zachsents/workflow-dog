
export type EventSourceCreation = "assigned" | "configured"

export type Common<A, B> = {
    [K in keyof A & keyof B]: A[K]
}