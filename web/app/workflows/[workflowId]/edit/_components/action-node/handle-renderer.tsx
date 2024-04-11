import { Button } from "@web/components/ui/button"
import { cn } from "@web/lib/utils"
import { uniqueId } from "@web/modules/util"
import { useDefinition, useNodePropertyValue } from "@web/modules/workflow-editor/graph/nodes"
import { produce } from "immer"
import { useMemo } from "react"
import { TbPlus } from "react-icons/tb"
import { useNodeId, useReactFlow } from "reactflow"
import { PREFIX } from "shared/prefixes"
import ActionNodeHandle from "./handle"


export default function HandleRenderer({ type }: { type: "input" | "output" }): React.JSX.Element {

    const rf = useReactFlow()
    const nodeId = useNodeId()

    const isInput = type === "input"
    const plural = isInput ? "inputs" : "outputs"

    const nodeDefinition = useDefinition()
    const interfaces: any[] = useNodePropertyValue(undefined, `data.${plural}`) || []

    const interfaceGroups = useMemo(
        () => Object.keys(nodeDefinition?.[plural] ?? {})
            .map(definitionId => [
                definitionId,
                interfaces.filter(
                    inter => inter.definition === definitionId
                        && !inter.hidden
                ),
            ] as const),
        // .filter(([, interfaces]) => interfaces.length > 0),
        [interfaces]
    )

    const addHandle = (definitionId: string) => {
        rf.setNodes(produce(draft => {
            const node = draft.find(node => node.id === nodeId)
            if (!node) return

            const definition = nodeDefinition?.[plural][definitionId]

            node.data[plural].push({
                id: uniqueId(isInput ? PREFIX.INPUT : PREFIX.OUTPUT),
                definition: definitionId,
                ...definition?.named && { name: "" },
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
                    const definition = nodeDefinition?.[plural][definitionId]
                    return (
                        <div key={definitionId}>
                            {definition?.group &&
                                <p className="text-xs text-muted-foreground">
                                    {definition.groupName || definition.name}
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

                            {definition?.group &&
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