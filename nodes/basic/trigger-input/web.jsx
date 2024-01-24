import { TbPlayerSkipForward } from "react-icons/tb"
import colors from "tailwindcss/colors"
import { useWorkflow } from "@web/modules/workflows"
import { object as triggerMap } from "triggers/web"
import { useNodeProperty } from "@web/modules/workflow-editor/graph/nodes"
import { useMemo } from "react"
import { object as typeMap } from "data-types/common"
import { Select, SelectItem } from "@nextui-org/react"


export default {
    name: "Use Data From Trigger",
    icon: TbPlayerSkipForward,
    color: colors.gray[800],
    tags: ["Trigger", "Basic"],
    inputs: {
        input: {
            description: "The input to get from the trigger.",
            defaultMode: "config",
            allowedModes: ["config"],
        },
    },
    outputs: {
        value: {
        }
    },
    renderBody: () => {
        const { data: workflow } = useWorkflow()
        const triggerDef = triggerMap[workflow?.trigger?.type]

        const triggerInputs = Object.entries(triggerDef?.inputs ?? {}).map(([key, value]) => ({
            id: key,
            label: value.name,
            type: value.type,
        }))

        const [triggerInput, setTriggerInput] = useNodeProperty(undefined, "data.input")
        const selectedKeys = useMemo(() => new Set(triggerInput ? [triggerInput] : []), [triggerInput])
        const onSelectionChange = (keys) => {
            setTriggerInput(keys.values().next().value)
        }

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
}