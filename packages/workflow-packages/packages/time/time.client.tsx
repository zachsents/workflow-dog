import { IconCalendar, IconClock } from "@tabler/icons-react"
import { createPackage } from "../../registry/registry.client"
import { useGraphBuilder, useNodeId } from "web/src/lib/graph-builder/core"
import { StandardNode } from "web/src/lib/graph-builder/standard-node"
import { useValueType } from "../../lib/value-types.client"
import { Calendar } from "web/src/components/ui/calendar"
import { Input } from "web/src/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "web/src/components/ui/popover"
import { Button } from "web/src/components/ui/button"
import TI from "web/src/components/tabler-icon"

const helper = createPackage("time")

helper.node("datetime", {
    name: "Date & Time",
    description: "A date and time.",
    icon: IconClock,
    component: () => {
        const gbx = useGraphBuilder()
        const nodeId = useNodeId()

        const date = gbx.useNodeState<Date | undefined>(nodeId, n => n.config.date)
        const setDate = (date: Date | undefined) => gbx.mutateNodeState(nodeId, n => n.config.date = date)

        const time = gbx.useNodeState<string>(nodeId, n => n.config.time ?? "09:00")
        const setTime = (time: string) => gbx.mutateNodeState(nodeId, n => n.config.time = time)

        // TO DO: add timezone

        return (
            <StandardNode hidePackageBadge>
                <StandardNode.Handle
                    type="output"
                    name="date"
                    displayName="Date & Time"
                    valueType={useValueType("date")}
                />
                <StandardNode.Content>
                    <div className="grid gap-2">
                        <DatePicker date={date} onChange={setDate} />
                        <Input
                            type="time"
                            value={time}
                            onChange={ev => setTime(ev.currentTarget.value)}
                        />
                    </div>
                </StandardNode.Content>
            </StandardNode>
        )
    }
})

helper.node("date", {
    name: "Date",
    description: "A date.",
    icon: IconCalendar,
    component: () => {
        const gbx = useGraphBuilder()
        const nodeId = useNodeId()

        const date = gbx.useNodeState<Date | undefined>(nodeId, n => n.config.date)
        const setDate = (date: Date | undefined) => gbx.mutateNodeState(nodeId, n => n.config.date = date)

        return (
            <StandardNode hidePackageBadge>
                <StandardNode.Handle
                    type="output"
                    name="date"
                    valueType={useValueType("date")}
                />
                <StandardNode.Content>
                    <DatePicker date={date} onChange={setDate} />
                </StandardNode.Content>
            </StandardNode>
        )
    }
})


function DatePicker({ date, onChange }: {
    date: Date | undefined
    onChange: (date: Date | undefined) => void
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 justify-start">
                    <TI><IconCalendar /></TI>
                    {date
                        ? date.toLocaleDateString(undefined, {
                            dateStyle: "short",
                        })
                        : <span className="text-muted-foreground">Select a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="z-[110] p-0 w-auto">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={onChange}
                    className=""
                />
            </PopoverContent>
        </Popover>
    )
}