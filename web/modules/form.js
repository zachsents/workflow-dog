import { produce } from "immer"
import { useMemo, useState } from "react"


/**
 * @template T
 * @param {object} options
 * @param {T} options.initial
 * @param {Record<keyof T, (value: T[keyof T], values: T) => string>} options.validate
 * @returns {FormHook<T>}
 */
export function useForm({ initial = {}, validate = {} } = {}) {

    const fields = useMemo(() => Object.keys(initial), [initial])

    const [values, setValues] = useState(initial)
    const setValue = (key, value) => setValues(produce(values, draft => {
        draft[key] = value
    }))

    const errors = useMemo(
        () => Object.fromEntries(fields.map(field => [field, validate[field]?.(values[field], values)])),
        [fields, values]
    )

    const isValid = useMemo(() => Object.values(errors).every(error => !error), [errors])

    const [touched, _setTouched] = useState({})
    const setTouched = key => _setTouched(produce(touched, draft => {
        draft[key] = true
    }))

    const reset = (key) => {
        if (key) {
            setValue(key, initial[key])
            _setTouched(produce(touched, draft => {
                draft[key] = false
            }))
            return
        }

        setValues(initial)
        _setTouched({})
    }

    return {
        values,
        setValues,
        setValue,
        inputProps: (key, {
            required = false,
            defaultValue = "",
            valueKey = "value",
            eventKey = "onValueChange",
        } = {}) => ({
            name: key,
            [valueKey]: values[key] ?? defaultValue,
            [eventKey]: newValue => {
                setValue(key, newValue)
                setTouched(key)
            },
            required,
            isRequired: required,
            errorMessage: touched[key] ? errors[key] : undefined,
            isInvalid: touched[key] ? Boolean(errors[key]) : undefined,
        }),
        errors,
        isValid,
        touched,
        submit: handler => ev => {
            ev.preventDefault()
            if (isValid)
                handler(values, ev)
        },
        reset,
    }
}


/**
 * @template T
 * @typedef {object} FormHook
 * @property {T} values
 * @property {(values: T) => void} setValues
 * @property {(key: keyof T, value: T[keyof T]) => void} setValue
 * @property {(key: keyof T, options: FormInputPropsOptions<T>) => FormInputProps<T[keyof T]>} inputProps
 * @property {Record<keyof T, string>} errors
 * @property {boolean} isValid
 * @property {Record<keyof T, boolean>} touched
 * @property {(handler: (values: T, ev: Event) => void) => (ev: Event) => void} submit
 * @property {(key?: keyof T) => void} reset
 */


/**
 * @template T
 * @typedef {object} FormInputPropsOptions
 * @property {boolean} required
 * @property {T[keyof T]} defaultValue
 * @property {string} valueKey
 * @property {string} eventKey
 */


/**
 * @template T
 * @typedef {object} FormInputProps
 * @property {string} name
 * @property {boolean} required
 * @property {boolean} isRequired
 * @property {string} errorMessage
 * @property {boolean} isInvalid
 */