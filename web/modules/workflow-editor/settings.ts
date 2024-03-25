import { useLocalStorageValue } from "@react-hookz/web"
import { produce } from "immer"
import _ from "lodash"


type EditorSettings = {
    showGrid: boolean
    showMinimap: boolean
}

const defaultSettings: EditorSettings = {
    showGrid: false,
    showMinimap: false,
}

export function useEditorSettings() {
    const { value: settings, set } = useLocalStorageValue("editorSettings", {
        defaultValue: defaultSettings,
    })

    function setKey<K extends keyof EditorSettings>(key: K, newValue: EditorSettings[K]) {
        if (!settings) return

        set(produce(settings, draft => {
            draft[key] = newValue
        }))
    }

    return [settings, setKey, set] as const
}