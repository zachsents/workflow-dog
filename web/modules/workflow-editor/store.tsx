import { produce } from "immer"
import _ from "lodash"
import { createContext, useCallback, useContext, useRef } from "react"
import { createStore, useStore, type StoreApi } from "zustand"
import { DotPath } from "../util"



type EditorStore = {
    selectedRunId?: string | null
    contextMenu: {
        position: { x: number, y: number } | null
    }
}

type EditorStoreApi = StoreApi<EditorStore>

const EditorStoreContext = createContext<EditorStoreApi | null>(null)

export function EditorStoreProvider({ children }: { children: any }) {
    const storeRef = useRef<EditorStoreApi | null>(null)

    if (!storeRef.current) {
        storeRef.current = createStore(() => ({
            selectedRunId: null,
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

    if (!storeApi)
        throw new Error("Missing StoreProvider")

    return storeApi
}


export function useEditorStore<T>(selector: (state: EditorStore) => T) {
    return useStore(useEditorStoreApi(), selector)
}


export function useEditorStoreState(path: DotPath<EditorStore>, defaultValue?: any) {
    const editorStore = useEditorStoreApi()

    const value = useEditorStore(s => _.get(s, path!))
    
    const setValue = useCallback((newValue: any) => {
        editorStore.setState(produce(draft => {
            _.set(draft, path!, newValue)
        }))
    }, [editorStore, path])

    if (defaultValue !== undefined && value === undefined)
        setValue(defaultValue)

    return [value, setValue] as const
}
