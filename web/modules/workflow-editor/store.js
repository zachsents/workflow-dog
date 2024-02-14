import { produce } from "immer"
import _ from "lodash"
import { createContext, useCallback, useContext, useRef } from "react"
import { createStore, useStore } from "zustand"


const EditorStoreContext = createContext(null)

export const EditorStoreProvider = ({ children }) => {
    const storeRef = useRef()
    if (!storeRef.current) {
        storeRef.current = createStore((set) => ({
            contextMenu: {
                // isOpen: false,
                position: null,
            },
        }))
    }
    return (
        <EditorStoreContext.Provider value={storeRef.current}>
            {children}
        </EditorStoreContext.Provider>
    )
}


export function useEditorStoreApi() {
    /** @type {import("zustand").StoreApi} */
    const storeApi = useContext(EditorStoreContext)

    if (!storeApi) {
        throw new Error("Missing StoreProvider")
    }

    return storeApi
}


export function useEditorStore(selector) {
    return useStore(useEditorStoreApi(), selector)
}


export function useEditorStoreState(path, defaultValue) {
    const editorStore = useEditorStoreApi()

    const value = useEditorStore(s => _.get(s, path))
    const setValue = useCallback(newValue => {
        editorStore.setState(produce(draft => {
            _.set(draft, path, newValue)
        }))
    }, [editorStore, path])

    if (defaultValue !== undefined && value === undefined)
        setValue(defaultValue)

    return [value, setValue]
}
