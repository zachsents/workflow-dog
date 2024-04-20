import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


export type OnEventKeys<Element extends keyof JSX.IntrinsicElements = "div"> = {
    [K in keyof JSX.IntrinsicElements[Element]]: K extends `on${string}` ? K : never
}[keyof JSX.IntrinsicElements[Element]]


export class CodedError extends Error {
    code: number | string

    constructor(message: string, code: number | string) {
        super(message)
        this.code = code
    }

    toString() {
        return `[${this.code}] ${this.message}`
    }
}   