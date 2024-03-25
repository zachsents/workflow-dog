import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


export type OnEventKeys<Element extends keyof JSX.IntrinsicElements = "div"> = {
    [K in keyof JSX.IntrinsicElements[Element]]: K extends `on${string}` ? K : never
}[keyof JSX.IntrinsicElements[Element]]