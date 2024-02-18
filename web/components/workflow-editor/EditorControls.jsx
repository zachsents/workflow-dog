import { useEditorStore } from "@web/modules/workflow-editor/store"
import EditorToolbar from "./EditorToolbar"
import RunViewer from "./RunViewer"
import RunViewerToolbar from "./RunViewerToolbar"
import Runner from "./Runner"
import TriggerControl from "./TriggerControl"


export default function EditorControls() {

    const isRunSelected = useEditorStore(s => !!s.selectedRunId)

    return (
        <div className="absolute top-0 left-0 w-full h-full p-unit-xs pointer-events-none z-20">
            <div className="w-full h-full relative">

                <div className="absolute top-0 left-0">
                    <TriggerControl />
                </div>

                <div className="absolute top-0 right-0 flex flex-col items-end gap-unit-xs">
                    <Runner />
                    <RunViewer />
                </div>

                <div className="absolute bottom-unit-lg left-1/2 -translate-x-1/2">
                    {isRunSelected ? 
                    <RunViewerToolbar /> :
                    <EditorToolbar />}
                </div>
            </div>
        </div>
    )
}
