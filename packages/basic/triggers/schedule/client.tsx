import type { WebTriggerDefinition } from "@types"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@ui/select"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@ui/tooltip"
import { Button } from "@web/components/ui/button"
import { Input } from "@web/components/ui/input"
import { cn } from "@web/lib/utils"
import { useForm } from "@web/modules/form"
import { uniqueId } from "@web/modules/util"
import { produce } from "immer"
import _ from "lodash"
import React, { useEffect, useState } from "react"
import { TbCheck, TbClock, TbPlus, TbX } from "react-icons/tb"
import type shared from "./shared"


export default {
    tags: ["Basic"],
    icon: TbClock,
    color: "#1f2937",
    renderConfig: ({ workflow, updateConfig, isUpdating, onClose }) => {

        const [intervals, setIntervals] = useState(workflow?.trigger?.config?.intervals || [])

        const saveIntervals = () => {
            const debugMessage = `Saving schedule intervals: ${intervals.length}`
            console.time(debugMessage)

            updateConfig({
                intervals: intervals.map(cleanInterval),
            }).then(() => {
                onClose?.()
                console.timeEnd(debugMessage)
            })
        }

        const addInterval = () => {
            setIntervals([...intervals, {
                id: uniqueId("schedule-interval"),
            }])
        }

        const removeInterval = (id: string) => {
            setIntervals(intervals?.filter((interval: Interval) => interval.id !== id))
        }

        const updateInterval = (id: string, value) => {
            setIntervals(produce(intervals, draft => {
                draft.find(interval => interval.id == id).value = value
            }))
        }

        const timezoneOffset = new Date().getTimezoneOffset() / 60
        const timezoneSymbol = timezoneOffset > 0 ? "+" : "-"

        return (
            <div className="flex-v items-stretch gap-4">
                <div className="flex-v gap-2">
                    <p className="font-bold text-sm">
                        Schedules:
                    </p>

                    {intervals.map(interval => (
                        <div className="flex items-center gap-2" key={interval.id}>
                            <Interval
                                initial={interval.value}
                                onChange={value => {
                                    updateInterval(interval.id, value)
                                }}
                                className="grow"
                            />

                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            size="icon" variant="ghost"
                                            onClick={() => void removeInterval(interval.id)}
                                            className="shrink-0"
                                        >
                                            <TbX />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Remove Schedule</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    ))}

                    <p className="text-xs text-muted-foreground">
                        Schedule times are in UTC. For you, it's currently {new Date().toLocaleString(undefined, {
                            timeZone: "UTC",
                            dateStyle: "medium",
                            timeStyle: "short",
                        })} ({timezoneSymbol}{Math.abs(timezoneOffset)} hours).
                    </p>

                    <div className="flex between gap-2">
                        <Button
                            size="sm" variant="secondary"
                            onClick={addInterval}
                        >
                            <TbPlus className="mr-2" />
                            Add schedule
                        </Button>
                        <Button
                            size="sm"
                            onClick={saveIntervals}
                            disabled={isUpdating}
                        >
                            <TbCheck className="mr-2" />
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        )
    },
} satisfies WebTriggerDefinition<typeof shared>


interface IntervalProps extends Omit<React.ComponentProps<"div">, "onChange"> {
    initial: Partial<Interval["value"]>
    onChange: (value: Interval["value"]) => void
}

function Interval({ initial, onChange, ...props }: IntervalProps) {

    const form = useForm({
        initial: {
            quantity: 1,
            unit: "minute",
            offsetMinutes: 0,
            offsetDays: 1,
            offsetWeekday: "mon",
            offsetTime: "09:00",
            ...initial,
        },
    })

    useEffect(() => {
        onChange?.(form.values as any)
    }, [form.values])

    return (
        <div
            {...props}
            className={cn("flex-v gap-1", props.className)}
        >
            <div className="flex items-center gap-2 flex-nowrap">
                <span>
                    Every
                </span>
                {form.values.unit !== "week" &&
                    <NumberInput
                        className="w-20"
                        {...form.inputProps("quantity", {
                            required: true,
                        })}
                    />}

                <Select
                    {...form.inputProps("unit", {
                        required: true,
                        valueKey: "defaultValue",
                    })}
                >
                    <SelectTrigger className="flex-1">
                        <SelectValue placeholder="minute, hour, etc." />
                    </SelectTrigger>
                    <SelectContent>
                        {units.map(interval =>
                            <SelectItem key={interval.id} value={interval.id}>
                                {interval.label}
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1 ml-unit-md">
                {form.values.unit === "month" &&
                    <OffsetDays
                        {...form.inputProps("offsetDays", {
                            required: true,
                        })}
                    />}

                {form.values.unit === "week" &&
                    <OffsetWeekday
                        {...form.inputProps("offsetWeekday", {
                            required: true,
                            valueKey: "defaultValue",
                        })}
                    />}

                {["day", "week", "month"].includes(form.values.unit) &&
                    <OffsetTime
                        {...form.inputProps("offsetTime", {
                            required: true,
                            eventKey: "onChange",
                            transformEvent: ev => ev.currentTarget.value,
                        })}
                    />}

                {form.values.unit === "hour" &&
                    <OffsetMinutes
                        {...form.inputProps("offsetMinutes", {
                            required: true,
                        })}
                    />}
            </div>
        </div>
    )
}


const units = [
    { id: "minute", label: "minute(s)" },
    { id: "hour", label: "hour(s)" },
    { id: "day", label: "day(s)" },
    { id: "week", label: "week" },
    { id: "month", label: "month(s)" },
]

const weekdays = [
    { id: "sun", name: "Sunday" },
    { id: "mon", name: "Monday" },
    { id: "tue", name: "Tuesday" },
    { id: "wed", name: "Wednesday" },
    { id: "thu", name: "Thursday" },
    { id: "fri", name: "Friday" },
    { id: "sat", name: "Saturday" },
]


function OffsetWeekday(props) {
    return (
        <div className="flex items-center gap-2 flex-nowrap">
            <span>
                on
            </span>
            <Select {...props}>
                <SelectTrigger>
                    <SelectValue placeholder="weekday" />
                </SelectTrigger>
                <SelectContent>
                    {weekdays.map(day =>
                        <SelectItem key={day.id} value={day.id}>
                            {day.name}
                        </SelectItem>)}
                </SelectContent>
            </Select>
        </div>
    )
}


function OffsetDays(props) {
    return (
        <div className="flex items-center gap-2 flex-nowrap">
            <span>
                on the
            </span>
            <NumberInput
                className="w-20"
                endContent={getSuffix(props.value)}
                min={1} max={31}
                {...props}
            />
            <span>
                day
            </span>
        </div>
    )
}


function OffsetTime(props) {

    return (
        <div className="flex items-center gap-2 flex-nowrap">
            <span>
                at
            </span>
            <Input
                type="time"
                className="w-40"
                {...props}
            />
        </div>
    )
}


function OffsetMinutes(props) {
    return (<div className="flex items-center gap-2 flex-nowrap">
        <span>
            on the
        </span>
        <div>
            <NumberInput
                className="w-20"
                endContent={getSuffix(props.value)}
                min={0} max={59}
                {...props}
            />
        </div>
        <span>
            minute
        </span>
    </div>)
}


function NumberInput({ value, endContent, ...props }: any) {
    return (
        <div className="flex center gap-1">
            <Input
                inputMode="numeric" type="number"
                min={1}
                placeholder="e.g. 1"
                {...props}
                defaultValue={value?.toString() ?? ""}
                onChange={ev => {
                    const numValue = parseInt(ev.currentTarget.value)
                    if (!isNaN(numValue))
                        props.onValueChange(numValue)
                }}
            />
            {endContent}
        </div>
    )
}


function getSuffix(n: number | string) {
    const lastDigit = parseInt(n.toString()) % 10
    if (lastDigit == 1 && n != 11)
        return "st"
    if (lastDigit == 2 && n != 12)
        return "nd"
    if (lastDigit == 3 && n != 13)
        return "rd"

    return "th"
}


function cleanInterval(interval: Interval) {
    return {
        id: interval.id,
        value: _.pick(interval.value, {
            minute: ["quantity", "unit"],
            hour: ["quantity", "unit", "offsetMinutes"],
            day: ["quantity", "unit", "offsetTime"],
            week: ["unit", "offsetWeekday", "offsetTime"],
            month: ["quantity", "unit", "offsetDays", "offsetTime"],
        }[interval.value.unit]),
    }
}

interface Interval {
    id: string
    value: {
        quantity: number
        unit: "minute" | "hour" | "day" | "week" | "month"
        offsetMinutes?: number
        offsetDays?: number
        offsetWeekday?: string
        offsetTime?: string
    }
}