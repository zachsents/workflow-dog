import { useDebouncedValue } from "@mantine/hooks"
import fuzzy from "fuzzy"
import _ from "lodash"
import { useMemo, useState } from "react"


// const interfaceDescriptionExtractor = (typeKey, nodeDef) => Object.values(nodeDef[typeKey]).map(interf => interf.description ?? "").join(" ")

// const nodeSearchIndex = lunr(function () {
//     this.ref("id")
//     this.field("name")
//     this.field("description")
//     this.field("tags", {
//         extractor: nodeDef => nodeDef.tags.join(" "),
//     })
//     this.field("interfaceDescriptions", {
//         extractor: nodeDef => interfaceDescriptionExtractor("inputs", nodeDef) + " " +
//             interfaceDescriptionExtractor("outputs", nodeDef),
//         boost: 0.3,
//     })

//     WebDefinitions.asArray.forEach(nodeDef => {
//         this.add(nodeDef)
//     })
// })

// export function searchNodes(query, tags = []) {
//     try {
//         return nodeSearchIndex.search(fixQuery(query))
//             .map(result => WebDefinitions.get(result.ref))
//             .filter(nodeDef => tags.every(tag => nodeDef.tags.includes(tag)))
//     }
//     catch (err) {
//         return []
//     }
// }


// const tagSearchIndex = lunr(function () {
//     this.ref("tag")
//     this.field("tag")

//     const tags = [...new Set(WebDefinitions.asArray.flatMap(def => def.tags))]
//     tags.forEach(tag => {
//         this.add({ tag })
//     })
// })

// export function searchTags(query) {
//     try {
//         return tagSearchIndex.search(fixQuery(query))
//             .map(result => result.ref)
//     }
//     catch (err) {
//         return []
//     }
// }


// function fixQuery(query) {
//     return query.split(/\s+/g).map(token => {
//         if (/^\w+$/.test(token))
//             return `+${token}~${Math.max(1, Math.min(4, token.length - 1))}`
//         return token
//     }).join(" ")
// }


const HIGHLIGHT_DELIMITER = "***"

/**
 * @param {any[]} list
 * @param {object} [options]
 * @param {Function} [options.selector]
 * @param {number} [options.debounce]
 * @param {boolean} [options.highlight]
 * @return {[any[], string, Function, string[][]]} 
 */
export function useSearch(list, {
    selector,
    debounce,
    highlight = false,
} = {}) {

    const [query, setQuery] = useState("")
    let queryToUse = query

    if (debounce != null) {
        const [debouncedQuery] = useDebouncedValue(query, debounce)
        queryToUse = debouncedQuery
    }

    const [filtered, strings] = useMemo(
        () => _.unzip(
            fuzzy.filter(queryToUse, list, {
                extract: selector,
                pre: HIGHLIGHT_DELIMITER,
                post: HIGHLIGHT_DELIMITER,
            })
                .map(result => [result.original, result.string.split(HIGHLIGHT_DELIMITER)])
        ),
        [list, queryToUse]
    )

    return [filtered ?? [], query, setQuery, highlight && (strings ?? [])]
}