
export function aOrAn(word: string) {
    return "aeiou".includes(word[0]) ? "an" : "a"
}

export function plural(word: string, q: number) {
    return q === 1 ? word : word + "s"
}

export function singular(word: string) {
    if (word.endsWith("ies"))
        return word.slice(0, -3) + "y"

    if (word.endsWith("s"))
        return word.slice(0, -1)

    return word
}


export function formatDate(date: Date, showDate = true, showTime = true) {
    return date?.toLocaleString(undefined, {
        dateStyle: showDate ? "short" : undefined,
        timeStyle: showTime ? "short" : undefined,
    })
}


export function durationSeconds(startDate: Date, endDate: Date, digits?: number) {
    if (!(startDate instanceof Date && endDate instanceof Date))
        return

    const duration = (endDate.getTime() - startDate.getTime()) / 1000

    if (digits == null) {
        const rounded = Math.round(duration)
        return rounded < 1 ? "<1 second" : `${rounded} ${plural("second", rounded)}`
    }

    return `${duration.toFixed(digits)} ${plural("second", duration)}`
}