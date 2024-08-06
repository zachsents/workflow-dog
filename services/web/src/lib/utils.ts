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