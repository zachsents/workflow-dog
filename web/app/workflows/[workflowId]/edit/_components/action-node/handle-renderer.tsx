import { Button } from "@web/components/ui/button"
import { cn } from "@web/lib/utils"
import { useDefinition, useNodePropertyValue } from "@web/modules/workflow-editor/graph/nodes"
import { useEditorStore } from "@web/modules/workflow-editor/store"
import { produce } from "immer"
import { useMemo } from "react"
import { TbPlus } from "react-icons/tb"
import { useNodeId, useReactFlow } from "reactflow"
import { IdNamespace, createRandomId } from "shared/utils"
import ActionNodeHandle from "./handle"


export default function HandleRenderer({ type }: { type: "input" | "output" }): React.JSX.Element {

    const rf = useReactFlow()
    const nodeId = useNodeId()

    const isInput = type === "input"
    const plural = isInput ? "inputs" : "outputs"

    const nodeDefinition = useDefinition()
    const interfaces: any[] = useNodePropertyValue(undefined, `data.${plural}`) || []

    const hasSelectedRun = useEditorStore(s => !!s.selectedRunId)

    const interfaceGroups = useMemo(
        () => Object.keys(nodeDefinition?.[plural] ?? {})
            .map(definitionId => [
                definitionId,
                interfaces.filter(
                    inter => inter.definition === definitionId
                        && !inter.hidden
                ),
            ] as const),
        [interfaces]
    )

    const addHandle = (definitionId: string) => {
        rf.setNodes(produce(draft => {
            const node = draft.find(node => node.id === nodeId)
            if (!node) return

            const definition = nodeDefinition?.[plural]?.[definitionId]

            node.data[plural].push({
                id: createRandomId(
                    isInput
                        ? IdNamespace.InputHandle
                        : IdNamespace.OutputHandle
                ),
                definition: definitionId,
                ...definition?.groupType === "record" && { name: "" },
            })
        }))
    }

    return (
        <div className="flex-v items-stretch gap-1 pt-1 pb-2 min-w-24">
            <p className="uppercase text-xs text-muted-foreground font-bold text-center">
                {plural}
            </p>
            {/* <Separator /> */}

            <div className="flex flex-col gap-2">
                {interfaceGroups.map(([definitionId, interfaces]) => {
                    const definition = nodeDefinition?.[plural]?.[definitionId]
                    const isMultiple = definition?.groupType === "list"
                        || definition?.groupType === "record"
                    return (
                        <div key={definitionId}>
                            {isMultiple &&
                                <p className="text-xs text-muted-foreground">
                                    {definition?.name}
                                </p>}

                            <div className={cn(
                                "flex flex-col items-stretch gap-1",
                                // isInput ? "-translate-x-2 items-start" : "translate-x-2 items-end",
                                // isInput ? "-translate-x-4" : "translate-x-4",
                            )}>
                                {interfaces.map(inter =>
                                    <ActionNodeHandle
                                        {...inter}
                                        definition={definition}
                                        type={type}
                                        key={inter.id}
                                    />
                                )}
                            </div>

                            {!hasSelectedRun && isMultiple &&
                                <Button
                                    size="sm" variant="link"
                                    className="text-xs h-[1.25em]"
                                    onClick={ev => {
                                        ev.stopPropagation()
                                        addHandle(definitionId)
                                    }}
                                >
                                    <TbPlus className="mr-2" />
                                    Add
                                </Button>}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}