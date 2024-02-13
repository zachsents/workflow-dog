
export function aOrAn(word) {
    return "aeiou".includes(word[0]) ? "an" : "a"
}

export function plural(word, q) {
    return q === 1 ? word : word + "s"
}

export function singular(word) {
    if (word.endsWith("ies"))
        return word.slice(0, -3) + "y"

    if (word.endsWith("s"))
        return word.slice(0, -1)

    return word
}

/**
 * @param {Date} date
 * @param {boolean} [showDate=true]
 * @param {boolean} [showTime=true]
 */
export function formatDate(date, showDate = true, showTime = true) {
    return date?.toLocaleString(undefined, {
        dateStyle: showDate ? "short" : undefined,
        timeStyle: showTime ? "short" : undefined,
    })
}


export function durationSeconds(startDate, endDate, digits) {
    if (!(startDate instanceof Date && endDate instanceof Date))
        return

    const duration = (endDate.getTime() - startDate.getTime()) / 1000

    if (digits == null) {
        const rounded = Math.round(duration)
        return rounded < 1 ? "<1 second" : `${rounded} ${plural("second", rounded)}`
    }

    return `${duration.toFixed(digits)} ${plural("second", duration)}`
}