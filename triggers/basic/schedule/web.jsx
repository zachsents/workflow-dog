import { Button, Input, Select, SelectItem, Tooltip } from "@nextui-org/react"
import { useApiMutation } from "@web/modules/api"
import { useForm } from "@web/modules/form"
import { uniqueId } from "@web/modules/workflow-editor/util"
import classNames from "classnames"
import { produce } from "immer"
import { useEffect, useState } from "react"
import { TbCheck, TbClock, TbPlus, TbX } from "react-icons/tb"
import { PREFIX } from "shared/prefixes"
import colors from "tailwindcss/colors"
import _ from "lodash"


export default {
    icon: TbClock,
    color: colors.gray[800],
    renderConfig: ({ workflow, workflowId, onClose }) => {

        const updateTriggerConfig = useApiMutation(`workflows/${workflowId}/trigger`, {
            method: "PATCH",
            invalidateQueries: ["workflow", workflowId],
        })

        const [intervals, setIntervals] = useState(workflow?.trigger?.config?.intervals || [])

        const saveIntervals = () => {
            const debugMessage = `Saving schedule intervals: ${intervals.length}`
            console.time(debugMessage)

            updateTriggerConfig.mutateAsync({
                config: {
                    intervals: intervals.map(cleanInterval),
                }
            }).then(() => {
                onClose?.()
                console.timeEnd(debugMessage)
            })
        }

        const addInterval = () => {
            setIntervals([...intervals, {
                id: uniqueId(PREFIX.SCHEDULE_INTERVAL),
            }])
        }

        const removeInterval = id => {
            setIntervals(intervals?.filter(interval => interval.id !== id))
        }

        const updateInterval = (id, value) => {
            setIntervals(produce(intervals, draft => {
                draft.find(interval => interval.id == id).value = value
            }))
        }

        const timezoneOffset = parseInt(new Date().getTimezoneOffset() / 60)
        const timezoneSymbol = timezoneOffset > 0 ? "+" : "-"

        return (
            <div className="flex flex-col items-stretch gap-unit-lg mt-unit-md">
                <div className="flex flex-col gap-unit-xs">
                    <p className="font-bold">
                        Schedules:
                    </p>

                    {intervals.map(interval => (
                        <div className="flex items-center gap-unit-xs" key={interval.id}>
                            <Interval
                                initial={interval.value}
                                onChange={value => {
                                    updateInterval(interval.id, value)
                                }}
                                className="grow"
                            />

                            <Tooltip closeDelay={0} content="Remove Schedule">
                                <Button
                                    isIconOnly size="sm" color="danger" variant="light"
                                    onPress={() => removeInterval(interval.id)}
                                    className="shrink-0"
                                >
                                    <TbX />
                                </Button>
                            </Tooltip>
                        </div>
                    ))}

                    <p className="text-xs text-default-500">
                        Schedule times are in UTC. For you, it's currently {new Date().toLocaleString(undefined, {
                            timeZone: "UTC",
                            dateStyle: "medium",
                            timeStyle: "short",
                        })} ({timezoneSymbol}{Math.abs(timezoneOffset)} hours).
                    </p>

                    <div className="flex items-center gap-unit-xs justify-between">
                        <Button
                            size="sm" startContent={<TbPlus />}
                            color="primary" variant="light"
                            onPress={addInterval}
                        >
                            Add schedule
                        </Button>
                        <Button
                            size="sm" startContent={<TbCheck />}
                            color="primary"
                            onPress={saveIntervals}
                            isLoading={updateTriggerConfig.isPending}
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        )
    },
}


function Interval({ initial, onChange, className }) {

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
        onChange?.(form.values)
    }, [form.values])

    return (
        <div className={classNames("flex flex-col gap-1", className)}>
            <FlexRow>
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
                    disallowEmptySelection
                    size="sm" placeholder="minute, hour, etc."
                    items={units}
                    className="flex-1"
                    classNames={{
                        trigger: "p-2 min-h-0 h-auto",
                    }}
                    {...form.inputProps("unit", {
                        required: true,
                        valueKey: "selectedKeys",
                        transformValue: value => new Set([value]),
                        eventKey: "onSelectionChange",
                        transformEvent: value => Array.from(value)[0],
                    })}
                >
                    {interval =>
                        <SelectItem key={interval.id} value={interval.id}>
                            {interval.label}
                        </SelectItem>}
                </Select>
            </FlexRow>

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
                            valueKey: "selectedKeys",
                            transformValue: value => new Set([value]),
                            eventKey: "onSelectionChange",
                            transformEvent: value => Array.from(value)[0],
                        })}
                    />}

                {["day", "week", "month"].includes(form.values.unit) &&
                    <OffsetTime
                        {...form.inputProps("offsetTime", {
                            required: true,
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


function OffsetWeekday({ ...props }) {

    return (<FlexRow>
        <span>
            on
        </span>
        <div>
            <Select
                disallowEmptySelection
                size="sm" placeholder="weekday"
                items={weekdays}
                className="w-40"
                classNames={{
                    trigger: "p-2 min-h-0 h-auto",
                }}
                {...props}
            >
                {day =>
                    <SelectItem key={day.id} value={day.id}>
                        {day.name}
                    </SelectItem>}
            </Select>
        </div>
    </FlexRow>)
}


function OffsetDays({ ...props }) {

    return (<FlexRow>
        <span>
            on the
        </span>
        <div>
            <NumberInput
                className="w-20"
                endContent={getSuffix(props.value)}
                min={1} max={31}
                {...props}
            />
        </div>
        <span>
            day
        </span>
    </FlexRow>)
}


function OffsetTime({ ...props }) {

    return (<FlexRow>
        <span>
            at
        </span>
        <div>
            <Input
                type="time"
                size="sm"
                className="w-40"
                classNames={{
                    inputWrapper: "p-2 min-h-0 h-auto"
                }}
                {...props}
            />
        </div>
    </FlexRow>)
}


function OffsetMinutes({ ...props }) {
    return (<FlexRow>
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
    </FlexRow>)
}


function NumberInput({ ...props }) {

    return (
        <Input
            inputMode="numeric" type="number"
            min={1}
            size="sm"
            placeholder="e.g. 1"
            classNames={{
                inputWrapper: "p-2 min-h-0 h-auto"
            }}
            {...props}
        />
    )
}


function FlexRow({ children, className, ...props }) {
    return (
        <div className={classNames("flex items-center gap-unit-xs flex-nowrap", className)} {...props}>
            {children}
        </div>
    )
}


function getSuffix(n) {
    const lastDigit = parseInt(n) % 10
    if (lastDigit == 1 && n != 11)
        return "st"
    if (lastDigit == 2 && n != 12)
        return "nd"
    if (lastDigit == 3 && n != 13)
        return "rd"

    return "th"
}


function cleanInterval(interval) {
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