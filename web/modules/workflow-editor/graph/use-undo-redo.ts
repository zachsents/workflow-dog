import { useDebouncedEffect } from "@react-hookz/web"
import { useCallback, useReducer } from "react"


type HistoryState<T = unknown> = {
    past: T[],
    future: T[],
    present: T,
}

type HistoryAction<T = unknown> = {
    type: "set"
    value: T
} | {
    type: "undo" | "redo"
}


export function useUndoRedo<T>(value: T, setValue: (newValue: T) => void, {
    historyLimit = 15,
    debounce = 0,
    equality = (a, b) => a === b,
}: {
    historyLimit?: number,
    debounce?: number,
    equality?: (a: T, b: T) => boolean,
} = {}) {

    const [history, dispatch] = useReducer((state: HistoryState<T>, action: HistoryAction<T>) => {

        const canUndo = state.past.length > 0
        const canRedo = state.future.length > 0

        if (action.type == "undo" && canUndo) {
            setValue?.(state.past[0])
            return {
                past: state.past.slice(1),
                future: [state.present, ...state.future],
                present: state.past[0],
            }
        }

        if (action.type == "redo" && canRedo) {
            setValue?.(state.future[0])
            return {
                past: [state.present, ...state.past],
                future: state.future.slice(1),
                present: state.future[0],
            }
        }

        if (action.type == "set" && !equality(action.value, state.present)) {
            return {
                past: [state.present, ...state.past].slice(0, historyLimit),
                future: [],
                present: action.value,
            }
        }

        return state
    }, {
        past: [],
        future: [],
        present: value,
    } satisfies HistoryState<T>)

    useDebouncedEffect(() => {
        dispatch({
            type: "set",
            value,
        })
    }, [value], debounce)

    const undo = useCallback(() => dispatch({ type: "undo" }), [])
    const redo = useCallback(() => dispatch({ type: "redo" }), [])

    return [history.present, undo, redo] as const
}
