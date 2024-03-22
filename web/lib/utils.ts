import { clsx, type ClassValue } from "clsx"
import { usePathname } from "next/navigation"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


export function useCurrentProjectId() {
    const pathname = usePathname()
    const activeProjectId = pathname?.match(/(?<=projects\/)[\w\-]+/)?.[0]
    return activeProjectId || null
}


