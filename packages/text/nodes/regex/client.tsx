import Editor from "@monaco-editor/react"
import { createClientNodeDefinition } from "@pkg/types"
import { ToggleGroup, ToggleGroupItem } from "@ui/toggle-group"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import type { editor } from "monaco-editor"
import React, { MutableRefObject, useMemo, useRef } from "react"
import { TbRegex } from "react-icons/tb"
import shared from "./shared"


export default createClientNodeDefinition(shared, {
    icon: TbRegex,
    color: "#4b5563",
    tags: ["Text"],
    searchTerms: ["string"],
    inputs: {},
    outputs: {
        regex: {},
    },
    renderBody: () => {

        const editorRef: MutableRefObject<editor.IStandaloneCodeEditor | null> = useRef(null)
        const onEditorMount: React.ComponentProps<typeof Editor>["onMount"] = (editor, monaco) => {
            editorRef.current = editor
            editor.onDidChangeCursorPosition(ev => {
                if (ev.position.lineNumber > 1) {
                    editor.setValue(editor.getValue().trim())
                    editor.setPosition({
                        ...ev.position,
                        column: Infinity,
                        lineNumber: 1,
                    })
                }
            })
        }

        const [pattern, setPattern] = useNodeProperty(undefined, "data.state.pattern", {
            defaultValue: "",
            debounce: 200,
        })

        const [flags, setFlags] = useNodeProperty(undefined, "data.state.flags", {
            defaultValue: "g",
            debounce: 200,
        })
        const flagsArr = useMemo(() => Array.from(new Set(flags)), [flags])
        const onFlagsArrChange = (flagsArr: string[]) => setFlags(flagsArr.join(""))

        return (
            <div className="flex-v items-stretch gap-2 min-w-[220px]">
                <p className="text-xs font-medium text-left">
                    Pattern
                </p>
                <div className="border rounded-md overflow-clip mt-1 px-1 flex items-center">
                    <span className="text-muted-foreground">/</span>
                    <Editor
                        height={36}
                        className="nodrag nopan"
                        defaultLanguage="plaintext"
                        defaultValue={pattern}
                        onChange={v => v && setPattern(v)}
                        options={{
                            lineNumbers: "off",
                            minimap: { enabled: false },
                            folding: false,
                            lineHeight: 36,
                            selectionHighlight: false,
                            foldingHighlight: false,
                            occurrencesHighlight: "off",
                            renderLineHighlight: "none",
                            fontSize: 18,
                            scrollbar: {
                                vertical: "hidden",
                                horizontalScrollbarSize: 6,
                            },
                            renderValidationDecorations: "off",
                            lineDecorationsWidth: 0,
                            overviewRulerLanes: 0,
                            renderWhitespace: "none",
                            wordBasedSuggestions: "off",
                        }}
                        onMount={onEditorMount}
                    />
                    <span className="text-muted-foreground">/</span>
                </div>

                <p className="text-xs font-medium text-left">
                    Flags
                </p>
                <ToggleGroup
                    type="multiple"
                    defaultValue={flagsArr} onValueChange={onFlagsArrChange}
                    className="self-center *:aspect-square *:h-7 *:p-0 grid grid-cols-4 gap-0.5"
                >
                    <ToggleGroupItem value="d">d</ToggleGroupItem>
                    <ToggleGroupItem value="g">g</ToggleGroupItem>
                    <ToggleGroupItem value="i">i</ToggleGroupItem>
                    <ToggleGroupItem value="m">m</ToggleGroupItem>
                    <ToggleGroupItem value="s">s</ToggleGroupItem>
                    <ToggleGroupItem value="u">u</ToggleGroupItem>
                    <ToggleGroupItem value="v">v</ToggleGroupItem>
                    <ToggleGroupItem value="y">y</ToggleGroupItem>
                </ToggleGroup>
            </div>
        )
    },
})
