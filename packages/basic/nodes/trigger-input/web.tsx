import { Select, SelectItem } from "@nextui-org/react"
import { useControlledSelectedKeys } from "@web/modules/util"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { useWorkflow } from "@web/modules/workflows"
import { object as typeMap } from "data-types/common"
import { useEffect } from "react"
import { TbPlayerSkipForward } from "react-icons/tb"
import { object as triggerMap } from "triggers/web"
import { WebNodeDefinition } from "@types"
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
        const { data: workflow } = useWorkflow()
        const triggerDef = triggerMap[workflow?.trigger?.type]

        const triggerInputs = Object.entries(triggerDef?.inputs ?? {})
            .map(([key, value]: [string, any]) => ({
                id: key,
                label: value.name,
                type: value.type,
            }))

        const [triggerInput, setTriggerInput] = useNodeProperty(undefined, "data.state.input")
        const { selectedKeys, onSelectionChange } = useControlledSelectedKeys(triggerInput, setTriggerInput)

        useEffect(() => {
            if (triggerInputs.length > 0 && triggerInput && !triggerInputs.find(i => i.id === triggerInput))
                setTriggerInput(triggerInputs[0].id)
        }, [JSON.stringify(triggerInputs), triggerInput])

        return (
            <Select
                selectedKeys={selectedKeys}
                onSelectionChange={onSelectionChange}
                selectionMode="single"
                size="sm"
                label="Input" labelPlacement="outside"
                placeholder="Pick one..."
                classNames={{
                    mainWrapper: "min-w-[12rem]"
                }}
                items={triggerInputs ?? []}
                isLoading={!workflow}
            >
                {item =>
                    <SelectItem key={item.id} value={item.id} textValue={item.label}>
                        <div className="gap-unit-sm">
                            <p>{item.label}</p>
                            {item.type &&
                                <p className="text-default-500 text-xs">{typeMap[item.type]?.name || "Any"}</p>}
                        </div>
                    </SelectItem>}
            </Select>
        )
    },
} satisfies WebNodeDefinition<typeof shared>
