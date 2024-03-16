import { produce } from "immer"
import _ from "lodash"
import { type Context, type MutableRefObject, createContext, useCallback, useContext, useRef } from "react"
import { type StoreApi, createStore, useStore } from "zustand"
import { DotPath } from "../util"


type EditorStore = {
    selectedRunId?: string
    contextMenu: {
        position: { x: number, y: number } | null
    }
}

const EditorStoreContext: Context<StoreApi<EditorStore>> = createContext(null)

export const EditorStoreProvider = ({ children }) => {
    const storeRef: MutableRefObject<StoreApi<EditorStore>> = useRef()
    if (!storeRef.current) {
        storeRef.current = createStore(() => ({
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
    const storeApi = useContext(EditorStoreContext)

    if (!storeApi) {
        throw new Error("Missing StoreProvider")
    }

    return storeApi
}


export function useEditorStore(selector: (state: EditorStore) => unknown) {
    return useStore(useEditorStoreApi(), selector)
}


export function useEditorStoreState(path: DotPath<EditorStore>, defaultValue?: any) {
    const editorStore = useEditorStoreApi()

    const value = useEditorStore(s => _.get(s, path))
    const setValue = useCallback((newValue: any) => {
        editorStore.setState(produce(draft => {
            _.set(draft, path, newValue)
        }))
    }, [editorStore, path])

    if (defaultValue !== undefined && value === undefined)
        setValue(defaultValue)

    return [value, setValue] as const
}
