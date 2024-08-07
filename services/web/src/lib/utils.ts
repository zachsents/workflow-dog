import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


export function getOffsetRelativeTo(child: HTMLElement, parent: HTMLElement = document.body) {
    let x = 0, y = 0
    let current: HTMLElement = child
    while (parent.contains(current) && current !== parent) {
        x += current.offsetLeft
        y += current.offsetTop
        current = current.offsetParent as HTMLElement
    }
    return { x, y }
}

export type PartialRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
export type RequiredExcept<T, K extends keyof T> = Required<Omit<T, K>> & Pick<T, K>


export function recursivelyReplaceInObject(
    obj: any,
    fixConditions: [
        (v: any, k?: string) => boolean | null | undefined,
        (v: any) => any
    ][] = [],
    key?: string,
): any {
    const fix = fixConditions.find(([condition]) => condition(obj, key))
    if (fix)
        return recursivelyReplaceInObject(fix[1](obj), fixConditions)

    if (Array.isArray(obj))
        return obj.map((v, i) => recursivelyReplaceInObject(v, fixConditions, i.toString()))
            .filter(v => v !== undefined)

    if (typeof obj === "object" && obj !== null && obj.constructor === Object)
        return Object.fromEntries(
            Object.entries(obj)
                .map(([k, v]) => [k, recursivelyReplaceInObject(v, fixConditions, k)])
                .filter(([, v]) => v !== undefined)
        )

    return obj
}


export function stripUnderscoredProperties(obj: any): any {

    if (typeof obj === "object" && obj !== null) {
        if (Array.isArray(obj))
            return obj.map(stripUnderscoredProperties)
        if (obj instanceof Map)
            return new Map(Array.from(obj.entries()).map(([k, v]) => [k, stripUnderscoredProperties(v)]))
        if (obj instanceof Set)
            return new Set(Array.from(obj).map(stripUnderscoredProperties))

        if (obj.constructor === Object)
            return Object.fromEntries(
                Object.entries(obj)
                    .filter(([k]) => !k.startsWith("_"))
                    .map(([k, v]) => [k, stripUnderscoredProperties(v)])
            )
    }

    return obj
}