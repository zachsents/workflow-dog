

export function assertArgProvided(value: any, name: string) {
    if (value == null)
        throw new Error(`No ${name} provided`)
}