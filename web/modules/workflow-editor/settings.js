import { useLocalStorageValue } from "@react-hookz/web"
import { produce } from "immer"
import _ from "lodash"

const defaultSettings = {
    showGrid: false,
    showMinimap: false,
}

export function useEditorSettings() {

    const { value: settings, set } = useLocalStorageValue("editorSettings", {
        defaultValue: defaultSettings,
    })

    const setKey = (path, newValue) => set(produce(settings, draft => {
        _.set(draft, path, newValue)
    }))

    return [settings, setKey, set]
}