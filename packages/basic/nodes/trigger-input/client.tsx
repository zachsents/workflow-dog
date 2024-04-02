import { DataTypeDefinitions, TriggerDefinitions } from "@pkg/client"
import { WebNodeDefinition } from "@types"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ui/select"
import { cn } from "@web/lib/utils"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { useWorkflow } from "@web/modules/workflows"
import { useEffect } from "react"
import { TbPlayerSkipForward } from "react-icons/tb"
import type shared from "./shared"


export default {
    icon: TbPlayerSkipForward,
    color: "#1f2937",
    tags: ["Trigger", "Basic"],
    inputs: {},
    outputs: {
        value: {}
    },
    renderBody: () => {
        const { data: workflow, isSuccess: hasWorkflowLoaded } = useWorkflow()
        const triggerDefinition = TriggerDefinitions.get((workflow?.trigger as any)?.type)

        const [triggerInput, setTriggerInput] = useNodeProperty(undefined, "data.state.input")

        const triggerInputIds = Object.keys(triggerDefinition?.inputs ?? {})

        useEffect(() => {
            if (hasWorkflowLoaded && triggerInput && !triggerInputIds.includes(triggerInput))
                setTriggerInput(null)
        }, [triggerDefinition?.id, triggerInput, hasWorkflowLoaded])

        const entries = Object.entries(triggerDefinition?.inputs ?? {})

        return (
            <Select onValueChange={setTriggerInput} defaultValue={triggerInput || undefined}>
                <SelectTrigger className={cn(
                    "min-w-[180px]",
                    triggerInput && "[&>span]:flex [&>span]:between [&>span]:gap-2",
                )}>
                    <SelectValue placeholder="Pick one..." />
                </SelectTrigger>
                <SelectContent>
                    {entries.length > 0
                        ? entries.map(([inputId, inputDefinition]) =>
                            <SelectItem value={inputId} key={inputId}>
                                <div className="w-full">{inputDefinition.name}</div>
                                <div className="text-muted-foreground">
                                    {DataTypeDefinitions.get(inputDefinition.type)?.name}
                                </div>
                            </SelectItem>
                        )
                        : <SelectItem disabled value="empty">No inputs available</SelectItem>}
                </SelectContent>
            </Select>
        )
    },
} satisfies WebNodeDefinition<typeof shared>
