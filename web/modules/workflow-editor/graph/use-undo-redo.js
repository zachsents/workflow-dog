import { useDebouncedEffect } from "@react-hookz/web"
import { useCallback, useReducer } from "react"


/**
 * @param {*} value
 * @param {function} setValue
 * @param {object} options
 * @param {number} [options.historyLimit=10]
 * @param {number} [options.debounce=0]
 * @param {function} [options.equality=(a, b) => a === b]
 */
export function useUndoRedo(value, setValue, {
    historyLimit = 15,
    debounce = 0,
    equality = (a, b) => a === b,
} = {}) {

    const [history, dispatch] = useReducer((state, action) => {

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
    })

    useDebouncedEffect(() => {
        dispatch({
            type: "set",
            value,
        })
    }, [value], debounce)

    const undo = useCallback(() => dispatch({ type: "undo" }), [])
    const redo = useCallback(() => dispatch({ type: "redo" }), [])

    return [history.present, undo, redo]
}
