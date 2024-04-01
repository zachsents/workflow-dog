import { produce } from "immer"
import { useMemo, useState } from "react"


interface UseFormOptions<T> {
    initial: T
    validate?: Record<keyof T, (value: T[keyof T], values: T) => string>
}

export function useForm<T extends Record<string, any>>({ initial, validate }: UseFormOptions<T>) {

    const fields = useMemo(() => Object.keys(initial), [initial])

    const [values, setValues] = useState(initial)
    function setValue<K extends keyof T>(key: K, value: T[K]) {
        setValues(produce(values, (draft: any) => {
            draft[key] = value
        }))
    }

    const errors = useMemo(
        () => Object.fromEntries(fields.map(field => [field, validate?.[field]?.(values[field], values)])),
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
            transformValue = value => value,
            transformEvent = event => event,
        } = {}) => ({
            name: key,
            [valueKey]: transformValue(values[key] ?? defaultValue),
            [eventKey]: newValue => {
                setValue(key, transformEvent(newValue))
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


type FormHook<T> = {
    values: T
    setValues: (values: T) => void
    setValue: (key: keyof T, value: T[keyof T]) => void
    inputProps: (key: keyof T, options: FormInputPropsOptions<T>) => FormInputProps
    errors: Record<keyof T, string>
    isValid: boolean
    touched: Record<keyof T, boolean>
    submit: (handler: (values: T, ev: Event) => void) => (ev: Event) => void
    reset: (key?: keyof T) => void
}

type FormInputPropsOptions<T> = {
    required: boolean
    defaultValue: T[keyof T]
    valueKey: string
    eventKey: string
}


type FormInputProps = {
    name: string
    required: boolean
    isRequired: boolean
    errorMessage: string
    isInvalid: boolean
}