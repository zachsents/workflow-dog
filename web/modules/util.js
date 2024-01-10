import _ from "lodash"
import { useRef } from "react"


export function deepCamelCase(obj) {
    if (obj instanceof Array)
        return obj.map(deepCamelCase)

    if (obj?.constructor === Object) {
        const withNewKeys = _.mapKeys(obj, (v, key) => _.camelCase(key))
        return _.mapValues(withNewKeys, deepCamelCase)
    }

    return obj
}


export function useSyncedRef(value) {
    const ref = useRef(value)
    ref.current = value
    return ref
}