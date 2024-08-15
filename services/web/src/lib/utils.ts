import { clsx, type ClassValue } from "clsx"
import _ from "lodash"
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


export function stripUnderscoredProperties(obj: any): any {
    return deepFilter(obj, (_, k) => !k?.toString().startsWith("_"))
}


export function deepFilter(
    obj: any,
    filter: (value: any, key: string | number | undefined, obj: any) => any,
) {
    const cloner = (value: any) => {
        if (_.isPlainObject(value))
            return _.mapValues(_.pickBy(value, filter), v => _.cloneDeepWith(v, cloner))
        if (Array.isArray(value))
            return value.filter(filter)
                .map(v => _.cloneDeepWith(v, cloner))
        if (value instanceof Map)
            return new Map(
                Array.from(value.entries())
                    .filter(([k, v]) => filter(v, k, value))
                    .map(([k, v]) => [k, _.cloneDeepWith(v, cloner)] as const)
            )
        if (value instanceof Set)
            return new Set(
                Array.from(value).filter(filter)
                    .map(v => _.cloneDeepWith(v, cloner))
            )
        return value
    }
    return _.cloneDeepWith(obj, cloner)
}
